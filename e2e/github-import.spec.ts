import { test, expect } from '@playwright/test'

test.describe('GitHub Import', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/github-import')
    await expect(page.getByText('GitHub Import')).toBeVisible({ timeout: 10_000 })
  })

  test('enter username and see skills', async ({ page }) => {
    await page.goto('/github-import')
    const input = page.locator('input[placeholder*="username"], input[placeholder*="Username"]').first()
    await input.fill('torvalds')
    await page.getByRole('button', { name: /анализировать|analyze|искать/i }).click()
    // Profile should appear
    await expect(page.getByText('torvalds')).toBeVisible({ timeout: 20_000 })
    // Skills list
    await expect(page.getByText(/навыков найдено|skills found/i)).toBeVisible({ timeout: 20_000 })
  })

  test('select skills and save', async ({ page }) => {
    await page.goto('/github-import')
    const input = page.locator('input[type="text"]').first()
    await input.fill('torvalds')
    // Submit
    await input.press('Enter')
    await expect(page.getByText('torvalds')).toBeVisible({ timeout: 20_000 })
    // Select all skills
    const selectAllBtn = page.getByRole('button', { name: /выбрать все|select all/i })
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click()
    } else {
      // Check first skill checkbox
      await page.locator('input[type="checkbox"]').first().check()
    }
    // Save
    const saveBtn = page.getByRole('button', { name: /сохранить|save/i })
    await expect(saveBtn).toBeEnabled()
    await saveBtn.click()
    // Success message
    await expect(page.getByText(/сохранено|saved/i)).toBeVisible({ timeout: 10_000 })
  })

  test('preset buttons work', async ({ page }) => {
    await page.goto('/github-import')
    // Click a preset (e.g. gvanrossum)
    const preset = page.getByRole('button', { name: 'gvanrossum' })
    if (await preset.isVisible()) {
      await preset.click()
      await expect(page.getByText('gvanrossum')).toBeVisible({ timeout: 20_000 })
    }
  })
})

test.describe('My Skills', () => {
  test('shows login prompt when unauthenticated', async ({ page }) => {
    await page.goto('/my-skills')
    await expect(page.getByText('Нужна авторизация')).toBeVisible({ timeout: 10_000 })
  })
})
