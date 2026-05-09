const { test, expect } = require('@playwright/test')

const EXPECTED_NOISE_PATTERNS = [
  /Failed to load resource:/i,
  /checkRpc Error:/i,
  /preselectRpc .* RPC is down/i,
  /Method getLastDepositIndex has error: Returned error: rpc method is not whitelisted/i,
  /Access to XMLHttpRequest at .* has been blocked by CORS policy/i,
  /net::ERR_/i,
  /askRelayerStatus /i,
  /\.eth invalid:/i,
  /Withdrawal queue is overloaded/i,
  /Cannot fetch status from the relayer/i,
  /Outdated version\./i
]

function isExpectedNoise(text) {
  return EXPECTED_NOISE_PATTERNS.some((re) => re.test(text))
}

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

function unexpectedErrors(messages) {
  return messages.filter(
    (m) => (m.type === 'error' || m.type === 'pageerror') && !isExpectedNoise(m.text)
  )
}

function errorMessageList(errors) {
  if (!errors.length) return 'no unexpected errors'
  return 'unexpected console errors:\n' + errors.map((e) => `  [${e.type}] ${e.text}`).join('\n')
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
  await expect(depositRows.first()).toBeVisible({ timeout: 60_000 })
  expect(await depositRows.count()).toBeGreaterThan(0)

  const errors = unexpectedErrors(consoleMessages)
  expect(errors, errorMessageList(errors)).toEqual([])
})

test('withdraw tab opens without console errors', async ({ page }) => {
  const consoleMessages = attachConsoleCapture(page)

  await page.goto('/')

  await expect(
    page.locator('.box-stats .field', { hasText: /equal user deposits/i }).first()
  ).toBeVisible({ timeout: 60_000 })

  const errorsBeforeSwitch = consoleMessages.length

  const withdrawTab = page.getByRole('tab', { name: /^Withdraw$/i }).first()
  await expect(withdrawTab).toBeVisible()
  await withdrawTab.click()

  await page.waitForTimeout(3000)

  const failedRelayersToast = page.locator('article.notification', {
    hasText: 'Failed to fetch relayers'
  })
  await expect(failedRelayersToast).toHaveCount(0)

  const newMessages = consoleMessages.slice(errorsBeforeSwitch)
  const newErrors = unexpectedErrors(newMessages)

  expect(newErrors, errorMessageList(newErrors)).toEqual([])
})
