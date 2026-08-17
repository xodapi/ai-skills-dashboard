import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads and shows key stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('AI Skills Analytics')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.glass').first()).toBeVisible()
  })

  test('top skills bar chart renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Топ-10 навыков по числу вакансий')).toBeVisible({ timeout: 10_000 })
    // recharts SVG rendered
    await expect(page.locator('svg').first()).toBeVisible()
  })

  test('salary hint widget shows median salary', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Python \+ ML/)).toBeVisible({ timeout: 15_000 })
    // Should show ₽ symbol after data loads
    await expect(page.getByText(/₽/)).toBeVisible({ timeout: 15_000 })
  })

  test('forecast snapshot widget shows rising skills', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('📈 Прогноз спроса · 3 месяца')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('↑ Растут')).toBeVisible({ timeout: 15_000 })
  })

  test('CTA tiles link to correct pages', async ({ page }) => {
    await page.goto('/')
    const salaryLink = page.locator('a[href="/salary-calculator"]').first()
    await expect(salaryLink).toBeVisible()
    const roadmapLink = page.locator('a[href="/roadmap"]')
    await expect(roadmapLink).toBeVisible()
  })
})
