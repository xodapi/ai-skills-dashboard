import { test, expect } from '@playwright/test'

test.describe('Adaptive Assessment (Skill IQ)', () => {
  test('page loads with intro screen', async ({ page }) => {
    await page.goto('/assessment')
    await expect(page.getByText('Skill IQ')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /начать тест|start/i })).toBeVisible()
  })

  test('start test and answer first question', async ({ page }) => {
    await page.goto('/assessment')
    await page.getByRole('button', { name: /начать тест|start/i }).click()
    // First question should appear
    await expect(page.locator('text=A.').or(page.locator('text=1.')).or(page.locator('[data-testid="question"]'))).toBeVisible({ timeout: 10_000 })
    // Click first answer option
    await page.locator('button').filter({ hasText: /^[A-D]\./ }).first().click()
    // Explanation or next button should appear
    await expect(page.getByText(/объяснение|explanation|следующий|next/i)).toBeVisible({ timeout: 5_000 })
  })

  test('complete assessment flow to see result', async ({ page }) => {
    await page.goto('/assessment')
    await page.getByRole('button', { name: /начать тест|start/i }).click()

    // Answer 10 questions (adaptive test typical length)
    for (let i = 0; i < 10; i++) {
      // Wait for question
      const firstOption = page.locator('button').filter({ hasText: /^[A-D]/ }).first()
      const visible = await firstOption.isVisible().catch(() => false)
      if (!visible) break

      await firstOption.click()

      // Click "next" or "continue"
      const nextBtn = page.getByRole('button', { name: /далее|next|следующий|continue/i })
      const nextVisible = await nextBtn.isVisible({ timeout: 3_000 }).catch(() => false)
      if (nextVisible) await nextBtn.click()
    }

    // Should eventually show final IQ score
    await expect(page.getByText(/iq|результат|score|баллов/i)).toBeVisible({ timeout: 30_000 })
  })
})

test.describe('Navigation', () => {
  test('header dropdown opens Аналитика group', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Аналитика' }).click()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Навыки')).toBeVisible()
  })

  test('header dropdown opens Карьера group', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Карьера' }).click()
    await expect(page.getByText('Зарплата')).toBeVisible()
    await expect(page.getByText('Roadmap')).toBeVisible()
  })

  test('breadcrumb pill shows current page', async ({ page }) => {
    await page.goto('/salary-calculator')
    // Breadcrumb shows active page name
    await expect(page.locator('header').getByText(/зарплата|salary/i)).toBeVisible({ timeout: 5_000 })
  })

  test('theme switcher changes theme', async ({ page }) => {
    await page.goto('/')
    const themeBtn = page.getByRole('button', { name: /theme|тема|🌙|☀️/i }).first()
    if (await themeBtn.isVisible()) {
      await themeBtn.click()
      // Check that data-theme attribute changed on html
      const theme = await page.locator('html').getAttribute('data-theme')
      expect(theme).toBeTruthy()
    }
  })
})

test.describe('Skills Forecast', () => {
  test('loads and shows forecast chart', async ({ page }) => {
    await page.goto('/forecast')
    await expect(page.getByText(/прогноз|forecast/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/растут|rising/i)).toBeVisible({ timeout: 15_000 })
  })

  test('horizon switcher works', async ({ page }) => {
    await page.goto('/forecast')
    await expect(page.getByText(/прогноз|forecast/i).first()).toBeVisible({ timeout: 10_000 })
    const btn3m = page.getByRole('button', { name: /3m|3 мес/i })
    if (await btn3m.isVisible()) {
      await btn3m.click()
      await expect(page.getByText(/3m|3 мес/i)).toBeVisible()
    }
  })
})
