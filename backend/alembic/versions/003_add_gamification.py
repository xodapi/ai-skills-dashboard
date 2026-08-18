"""Add persistent learner gamification.

Revision ID: 003
Revises: 002
Create Date: 2026-08-18 23:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create XP, badges, and activity tables."""
    op.add_column(
        "training_progress",
        sa.Column("xp_awarded", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "training_progress", sa.Column("rewarded_at", sa.DateTime(), nullable=True)
    )
    op.create_unique_constraint(
        "uq_progress_user_skill_module",
        "training_progress",
        ["user_id", "skill", "module_index"],
    )
    op.create_table(
        "user_gamification",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("total_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_activity_date", sa.Date(), nullable=True),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_table(
        "user_badges",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("badge_key", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column(
            "unlocked_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "badge_key", name="uq_user_badge"),
    )
    op.create_index("idx_user_badges_user_id", "user_badges", ["user_id"])
    op.create_table(
        "learning_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("training_progress_id", sa.Integer(), nullable=False),
        sa.Column("activity_date", sa.Date(), nullable=False),
        sa.Column(
            "activity_type",
            sa.String(length=50),
            nullable=False,
            server_default="exercise_completed",
        ),
        sa.Column("skill", sa.String(length=100), nullable=False),
        sa.Column("module_index", sa.Integer(), nullable=False),
        sa.Column("xp_earned", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["training_progress_id"],
            ["training_progress.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("training_progress_id"),
    )
    op.create_index(
        "idx_learning_activities_user_date",
        "learning_activities",
        ["user_id", "activity_date"],
    )


def downgrade() -> None:
    """Remove learner gamification tables and columns."""
    op.drop_index("idx_learning_activities_user_date", table_name="learning_activities")
    op.drop_table("learning_activities")
    op.drop_index("idx_user_badges_user_id", table_name="user_badges")
    op.drop_table("user_badges")
    op.drop_table("user_gamification")
    op.drop_constraint(
        "uq_progress_user_skill_module", "training_progress", type_="unique"
    )
    op.drop_column("training_progress", "rewarded_at")
    op.drop_column("training_progress", "xp_awarded")
