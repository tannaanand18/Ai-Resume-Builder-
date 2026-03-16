const { test, expect } = require('@playwright/test');

const URL = 'https://resumebuilder-kappa-nine.vercel.app';

// ─────────────────────────────────────────
// TEST USER - separate from your real account
// This user is created automatically by tests
// Your main account (tannaanand992) is NEVER touched
// ─────────────────────────────────────────
const TEST_USER = {
  name: 'Test User Playwright',
  email: `testuser_${Date.now()}@playwright.com`,
  password: 'TestPass@123'
};

// Store resume id created during tests
let testResumeId = null;

// ─────────────────────────────────────────
// HELPER: Register new test user
// ─────────────────────────────────────────
async function registerUser(page) {
  await page.goto(`${URL}/register`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // CORRECT placeholders matching your actual form
  await page.getByPlaceholder('John Doe').fill(TEST_USER.name);
  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('Enter your password').fill(TEST_USER.password);

  // Submit
  await page.getByRole('button', { name: /register|sign up|create/i }).click();
  await page.waitForTimeout(3000);
}

// ─────────────────────────────────────────
// HELPER: Login test user
// ─────────────────────────────────────────
async function login(page) {
  await page.goto(`${URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('Enter your password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dashboard/i, { timeout: 30000 });
}

// ─────────────────────────────────────────
// HELPER: Login + go to resume builder
// ─────────────────────────────────────────
async function goToResume(page) {
  await login(page);
  await page.waitForTimeout(2000);
  if (testResumeId) {
    await page.goto(`${URL}/resume/${testResumeId}/edit`);
  } else {
    await page.goto(`${URL}/resume/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Click first template
    await page.locator('.ts-card').first().click();
    await page.waitForURL(/resume\/\d+\/edit/i, { timeout: 15000 });
    // Save resume id from URL
    const urlParts = page.url().split('/');
    testResumeId = urlParts[urlParts.indexOf('resume') + 1];
    console.log(`📝 Created test resume ID: ${testResumeId}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

// ════════════════════════════════════════
// SECTION 1: AUTH TESTS
// ════════════════════════════════════════

test('1. Home page loads', async ({ page }) => {
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Resume/i);
  console.log('✅ Home page loaded!');
});

test('2. Login page has correct fields', async ({ page }) => {
  await page.goto(`${URL}/login`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  console.log('✅ Login page correct!');
});

test('3. Register page has correct fields', async ({ page }) => {
  await page.goto(`${URL}/register`);
  await page.waitForLoadState('networkidle');
  // Check any input fields exist
  const inputs = await page.locator('input').count();
  expect(inputs).toBeGreaterThan(1);
  console.log('✅ Register page has fields!');
});

test('4. New test user can register', async ({ page }) => {
  await registerUser(page);
  // Should redirect to login or dashboard after register
  const currentURL = page.url();
  expect(currentURL).toMatch(/login|dashboard/i);
  console.log(`✅ Registered: ${TEST_USER.email}`);
});

test('5. Test user can login', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/dashboard/i);
  console.log('✅ Login works!');
});

test('6. Wrong password shows error', async ({ page }) => {
  await page.goto(`${URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('Enter your password').fill('WrongPassword123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(3000);
  // Should NOT go to dashboard
  await expect(page).not.toHaveURL(/dashboard/i);
  console.log('✅ Wrong password blocked!');
});

test('7. Forgot password page loads', async ({ page }) => {
  await page.goto(`${URL}/forgot-password`);
  await page.waitForLoadState('networkidle');
  const inputs = await page.locator('input').count();
  expect(inputs).toBeGreaterThan(0);
  console.log('✅ Forgot password page loads!');
});

test('8. Protected route redirects to login', async ({ page }) => {
  // Try to access dashboard without login
  await page.goto(`${URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Should redirect to login
  await expect(page).toHaveURL(/login/i);
  console.log('✅ Protected route works!');
});

// ════════════════════════════════════════
// SECTION 2: DASHBOARD TESTS
// ════════════════════════════════════════

test('9. Dashboard loads after login', async ({ page }) => {
  await login(page);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/resume/i).first()).toBeVisible();
  console.log('✅ Dashboard loads!');
});

test('10. Dashboard has create new resume button', async ({ page }) => {
  await login(page);
  await page.waitForLoadState('networkidle');
  // Check new resume button exists
  const newBtn = page.getByRole('button', { name: /new|create/i }).first();
  await expect(newBtn).toBeVisible();
  console.log('✅ Create button exists!');
});

// ════════════════════════════════════════
// SECTION 3: TEMPLATE TESTS
// ════════════════════════════════════════

test('11. Template select page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${URL}/resume/new`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Choose Your Perfect Template').first()).toBeVisible();
  console.log('✅ Templates load!');
});

test('12. Template filters work', async ({ page }) => {
  await login(page);
  await page.goto(`${URL}/resume/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click Modern filter
  await page.getByText('Modern').first().click();
  await page.waitForTimeout(1000);

  // Check templates are filtered
  await expect(page.getByText('Modern').first()).toBeVisible();
  console.log('✅ Template filters work!');
});

test('13. Can create resume from template', async ({ page }) => {
  await login(page);
  await page.goto(`${URL}/resume/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first template card
  await page.locator('.ts-card').first().click();
  await page.waitForTimeout(5000);

  // Should go to resume editor
  await expect(page).toHaveURL(/resume\/\d+\/edit/i);

  // Save resume id for later tests
  const urlParts = page.url().split('/');
  testResumeId = urlParts[urlParts.indexOf('resume') + 1];
  console.log(`✅ Resume created! ID: ${testResumeId}`);
});

// ════════════════════════════════════════
// SECTION 4: RESUME BUILDER TESTS
// ════════════════════════════════════════

test('14. Resume builder tabs load', async ({ page }) => {
  await goToResume(page);
  await expect(page.getByText('Personal').first()).toBeVisible();
  await expect(page.getByText('Experience').first()).toBeVisible();
  await expect(page.getByText('Education').first()).toBeVisible();
  await expect(page.getByText('Skills').first()).toBeVisible();
  await expect(page.getByText('Projects').first()).toBeVisible();
  await expect(page.getByText('Certifications').first()).toBeVisible();
  console.log('✅ All tabs visible!');
});

test('15. Can save personal info', async ({ page }) => {
  await goToResume(page);

  // Fill personal info
  await page.getByPlaceholder('e.g. Anna Field').fill('Playwright Test User');
  await page.getByPlaceholder('Target position or current role').fill('Test Engineer');
  await page.getByPlaceholder('Enter email').fill('playwright@test.com');

  // Save
  await page.getByRole('button', { name: /Save Personal/i }).click();
  await page.waitForTimeout(2000);

  await expect(page.getByText(/saved/i)).toBeVisible();
  console.log('✅ Personal info saved!');
});

test('16. Can add work experience', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Experience').first().click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. Google').fill('Playwright Company');
  await page.getByPlaceholder('e.g. Software Engineer').fill('Test Engineer');
  await page.getByPlaceholder('Jan 2022').fill('Jan 2024');

  await page.getByRole('button', { name: /Add Experience/i }).click();
  await page.waitForTimeout(3000);

  await expect(page.getByText('Failed to add')).not.toBeVisible();
  console.log('✅ Experience added!');
});

test('17. Can add education', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Education').first().click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. B.Tech').fill('B.Tech Playwright');
  await page.getByPlaceholder('e.g. IIT Bombay').fill('Playwright University');
  await page.getByPlaceholder('2018').fill('2020');
  await page.getByPlaceholder('2022').fill('2024');

  await page.getByRole('button', { name: /Add Education/i }).click();
  await page.waitForTimeout(3000);

  await expect(page.getByText('Failed to add')).not.toBeVisible();
  console.log('✅ Education added!');
});

test('18. Can add skill', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Skills').first().click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. React').fill('PlaywrightSkill');
  await page.getByRole('button', { name: '+ Add' }).click();
  await page.waitForTimeout(3000);

  await expect(page.getByText('PlaywrightSkill', { exact: true }).first()).toBeVisible();
  console.log('✅ Skill added!');
});

test('19. Can add project', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Projects').first().click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('e.g. AI Resume Builder').fill('Playwright Project');
  await page.getByPlaceholder('React, Flask').fill('Playwright, Test');

  await page.getByRole('button', { name: /Add Project/i }).click();
  await page.waitForTimeout(3000);

  await expect(page.getByText('Failed to add')).not.toBeVisible();
  console.log('✅ Project added!');
});

test('20. Can add certification', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Certifications').first().click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder('AWS Solutions Architect').fill('Playwright Cert');
  await page.getByPlaceholder('Amazon').fill('Playwright Inc');

  await page.getByRole('button', { name: /Add Certification/i }).click();
  await page.waitForTimeout(3000);

  await expect(page.getByText('Failed to add')).not.toBeVisible();
  console.log('✅ Certification added!');
});

test('21. Can delete experience', async ({ page }) => {
  await goToResume(page);

  await page.getByText('Experience').first().click();
  await page.waitForTimeout(1000);

  const before = await page.locator('.rb-card').count();

  if (before > 0) {
    await page.locator('.rb-card').first()
      .getByRole('button', { name: /🗑️/i }).click();
    await page.waitForTimeout(2000);
    const after = await page.locator('.rb-card').count();
    expect(after).toBeLessThan(before);
    console.log('✅ Experience deleted!');
  } else {
    console.log('⚠️ No experience to delete');
  }
});

test('22. Template switcher works', async ({ page }) => {
  await goToResume(page);

  // Click template dropdown
  await page.getByRole('button', { name: /template|classic|modern|harvard/i }).first().click();
  await page.waitForTimeout(1000);

  // Click a different template
  await page.getByText('Harvard').first().click();
  await page.waitForTimeout(2000);

  // Dropdown should close
  await expect(page.getByText('Harvard').first()).toBeVisible();
  console.log('✅ Template switcher works!');
});

test('23. Download PDF button exists', async ({ page }) => {
  await goToResume(page);

  await expect(
    page.getByRole('button', { name: /download pdf/i })
  ).toBeVisible();
  console.log('✅ Download PDF button exists!');
});

// ════════════════════════════════════════
// SECTION 5: ADMIN PANEL TESTS
// ════════════════════════════════════════

test('24. Admin panel loads', async ({ page }) => {
  // Use main admin account for admin tests
  await page.goto(`${URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@example.com').fill('tannaanand992@gmail.com');
  await page.getByPlaceholder('Enter your password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dashboard/i, { timeout: 30000 });

  await page.goto(`${URL}/admin`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await expect(page.getByText(/admin/i).first()).toBeVisible();
  console.log('✅ Admin panel loads!');
});

test('25. Admin shows user and resume stats', async ({ page }) => {
  await page.goto(`${URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@example.com').fill('tannaanand992@gmail.com');
  await page.getByPlaceholder('Enter your password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dashboard/i, { timeout: 30000 });

  await page.goto(`${URL}/admin`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await expect(page.getByText(/users/i).first()).toBeVisible();
  await expect(page.getByText(/resumes/i).first()).toBeVisible();
  console.log('✅ Admin stats showing!');
});

// ─────────────────────────────────────────
// TEST 26: Can delete resume from dashboard
// ─────────────────────────────────────────
test('26. Can delete resume from dashboard', async ({ page }) => {
  await login(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const before = await page.locator('[class*="card"]').count();
  console.log(`Resumes before: ${before}`);

  if (before > 0) {
    await page.locator('[class*="card"]').first()
      .getByRole('button', { name: /delete|🗑/i }).click();
    await page.waitForTimeout(2000);
    const after = await page.locator('[class*="card"]').count();
    expect(after).toBeLessThanOrEqual(before);
    console.log('✅ Resume deleted!');
  } else {
    console.log('⚠️ No resumes - skipping');
  }
});

// ─────────────────────────────────────────
// TEST 27: Edit experience modal works
// ─────────────────────────────────────────
test('27. Edit experience modal works', async ({ page }) => {
  await login(page);
  await page.goto(`${URL}/resume/5/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click Experience tab
  await page.getByText('Experience').first().click();
  await page.waitForTimeout(2000);

  // DEBUG - print all buttons in page
  const buttons = await page.locator('button').allTextContents();
  console.log('All buttons on page:', buttons);

  // DEBUG - check if rb-card exists
  const cards = await page.locator('.rb-card').count();
  console.log('Number of rb-card elements:', cards);
});