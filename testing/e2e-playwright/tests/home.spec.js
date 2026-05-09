const { test, expect } = require('@playwright/test')

function attachConsoleCapture(page) {
  const messages = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      messages.push({ type: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (err) => {
    messages.push({ type: 'pageerror', text: err.message })
  })
  return messages
}

test('deposit tab loads anonymity set and latest deposits', async ({ page }) => {
  const consoleMessages = attachConsoleCapture(page)

  await page.goto('/')

  const equalUserDepositsField = page
    .locator('.box-stats .field', { hasText: /equal user deposits/i })
    .first()
  await expect(equalUserDepositsField).toBeVisible({ timeout: 60_000 })

  const anonymityText = await equalUserDepositsField.textContent()
  expect(anonymityText).toMatch(/\d/)

  const depositRows = page.locator('.box-stats .deposits .row')
  await expect(depositRows.first()).toBeVisible({ timeout: 30_000 })
  expect(await depositRows.count()).toBeGreaterThan(0)

  const errors = consoleMessages.filter((m) => m.type === 'error' || m.type === 'pageerror')
  expect(errors, errorMessageList(errors)).toEqual([])
})

test('withdraw tab opens without console errors', async ({ page }) => {
  const consoleMessages = attachConsoleCapture(page)

  await page.goto('/')

  await expect(page.getByText(/equal user deposits/i).first()).toBeVisible({ timeout: 60_000 })

  const errorsBeforeSwitch = consoleMessages.length

  const withdrawTab = page.getByRole('tab', { name: /^Withdraw$/i }).first()
  await expect(withdrawTab).toBeVisible()
  await withdrawTab.click()

  await expect(page.getByText(/note/i).first()).toBeVisible()

  await page.waitForTimeout(2000)

  const failedRelayersToast = page.locator('article.notification', {
    hasText: 'Failed to fetch relayers'
  })
  await expect(failedRelayersToast).toHaveCount(0)

  const newMessages = consoleMessages.slice(errorsBeforeSwitch)
  const newErrors = newMessages.filter((m) => m.type === 'error' || m.type === 'pageerror')

  expect(newErrors, errorMessageList(newErrors)).toEqual([])
})

function errorMessageList(errors) {
  if (!errors.length) return 'no errors'
  return 'unexpected console errors:\n' + errors.map((e) => `  [${e.type}] ${e.text}`).join('\n')
}
