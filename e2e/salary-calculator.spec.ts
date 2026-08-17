import { test, expect } from '@playwright/test'

test.describe('Salary Calculator', () => {
  test('page loads with default skills selected', async ({ page }) => {
    await page.goto('/salary-calculator')
    await expect(page.getByText('Калькулятор зарплаты')).toBeVisible({ timeout: 10_000 })
    // Default skills should be visible
    await expect(page.getByText('Python')).toBeVisible()
    await expect(page.getByText('Machine Learning')).toBeVisible()
  })

  test('calculate salary and see result', async ({ page }) => {
    await page.goto('/salary-calculator')
    // Click calculate button
    const calcBtn = page.getByRole('button', { name: /рассчитать/i })
    await calcBtn.click()
    // Should show median salary
    await expect(page.getByText(/медиана/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/₽/)).toBeVisible({ timeout: 15_000 })
  })

  test('change experience slider and recalculate', async ({ page }) => {
    await page.goto('/salary-calculator')
    // Set experience to 5 years
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('5')
    // Calculate
    await page.getByRole('button', { name: /рассчитать/i }).click()
    await expect(page.getByText(/₽/)).toBeVisible({ timeout: 15_000 })
  })

  test('add extra skill and see salary impact', async ({ page }) => {
    await page.goto('/salary-calculator')
    // Type a skill in search
    const search = page.locator('input[placeholder*="навык"]').first()
    await search.fill('Docker')
    // Click Docker skill chip
    await page.getByText('Docker').first().click()
    // Calculate
    await page.getByRole('button', { name: /рассчитать/i }).click()
    await expect(page.getByText(/skill_impact|влияние|Docker/i)).toBeVisible({ timeout: 15_000 })
  })

  test('switch employment type to remote', async ({ page }) => {
    await page.goto('/salary-calculator')
    await page.getByText('Remote').click()
    await page.getByRole('button', { name: /рассчитать/i }).click()
    await expect(page.getByText(/₽/)).toBeVisible({ timeout: 15_000 })
  })
})
