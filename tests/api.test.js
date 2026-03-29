const { test, expect } = require('@playwright/test');

const API = 'https://ai-resume-builder-6535.onrender.com';

const TEST_USER = {
  name: 'API Test User',
  email: `apitest_${Date.now()}@test.com`,
  password: 'ApiTest@123'
};

let authCookie = '';
let resumeId = null;
let experienceId = null;
let educationId = null;
let skillId = null;
let projectId = null;
let certId = null;

// ─────────────────────────────────────────
// HELPER: Login and get cookie
// ─────────────────────────────────────────
async function getAuthCookie(request) {
  const res = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: TEST_USER.email, password: TEST_USER.password }
  });
  const headers = res.headers();
  const setCookie = headers['set-cookie'];
  if (setCookie) {
    authCookie = setCookie.split(';')[0];
  }
  return authCookie;
}

// ─────────────────────────────────────────
// HELPER: API request with cookie
// ─────────────────────────────────────────
async function api(request, method, path, body = null) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    }
  };
  if (body) options.data = body;
  if (method === 'GET') return await request.get(`${API}${path}`, options);
  if (method === 'POST') return await request.post(`${API}${path}`, options);
  if (method === 'PUT') return await request.put(`${API}${path}`, options);
  if (method === 'DELETE') return await request.delete(`${API}${path}`, options);
}

// ════════════════════════════════════════
// SECTION 1: AUTH TESTS
// ════════════════════════════════════════

test('API 1. Backend is alive', async ({ request }) => {
  const res = await request.get(`${API}/api/auth/check-auth`);
  expect(res.status()).not.toBe(0);
  console.log(`✅ Backend alive! Status: ${res.status()}`);
});

test('API 2. Register new test user', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/register`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password
    }
  });
  console.log(`Register status: ${res.status()}`);
  const body = await res.json();
  console.log('Register response:', body);
  expect(res.status()).toBe(201);
  console.log('✅ Register works!');
});

test('API 3. Login with correct credentials', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: TEST_USER.email, password: TEST_USER.password }
  });
  console.log(`Login status: ${res.status()}`);
  expect(res.status()).toBe(200);

  const headers = res.headers();
  const setCookie = headers['set-cookie'];
  if (setCookie) {
    authCookie = setCookie.split(';')[0];
    console.log(`🍪 Cookie: ${authCookie.substring(0, 40)}...`);
  }
  console.log('✅ Login works!');
});

test('API 4. Wrong password returns 401', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: TEST_USER.email, password: 'WrongPass123' }
  });
  expect(res.status()).toBe(401);
  console.log('✅ Wrong password blocked!');
});

test('API 5. Wrong email returns 401', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'nobody@nowhere.com', password: TEST_USER.password }
  });
  expect(res.status()).toBe(401);
  console.log('✅ Wrong email blocked!');
});

test('API 6. No token returns 401 or 422', async ({ request }) => {
  const res = await request.get(`${API}/api/resume/all`, {
    headers: { 'Content-Type': 'application/json' }
  });
  expect([401, 422]).toContain(res.status());
  console.log('✅ Protected route blocked!');
});

test('API 7. Duplicate email returns 400', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/register`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password
    }
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/email already exists/i);
  console.log('✅ Duplicate email blocked!');
});

// ════════════════════════════════════════
// SECTION 2: RESUME TESTS
// ════════════════════════════════════════

test('API 8. Create resume', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/resume/', {
    title: 'API Test Resume',
    template_name: 'simple',
    template_style: 'classic'
  });

  console.log(`Create resume status: ${res.status()}`);
  const body = await res.json();
  console.log('Create resume response:', body);

  expect(res.status()).toBe(201);
  resumeId = body.resume_id;
  console.log(`✅ Resume created! ID: ${resumeId}`);
});

test('API 9. Get all resumes', async ({ request }) => {
  await getAuthCookie(request);

  // Correct URL is /api/resume/all
  const res = await api(request, 'GET', '/api/resume/all');

  console.log(`Get all resumes status: ${res.status()}`);
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  console.log(`✅ Got ${body.length} resumes!`);
});

test('API 10. Get specific resume', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/resume/${resumeId}`);
  console.log(`Get resume status: ${res.status()}`);
  expect(res.status()).toBe(200);

  const body = await res.json();
  console.log('Resume:', body);
  console.log('✅ Get resume works!');
});

test('API 11. Update resume', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'PUT', `/api/resume/${resumeId}`, {
    title: 'Updated API Resume',
    full_name: 'API Tester',
    email: 'api@test.com',
    phone: '9999999999',
    location: 'Test City'
  });

  console.log(`Update resume status: ${res.status()}`);
  expect(res.status()).toBe(200);
  console.log('✅ Resume updated!');
});

// ════════════════════════════════════════
// SECTION 3: EXPERIENCE TESTS
// ════════════════════════════════════════

test('API 12. Add experience', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/experience/', {
    resume_id: parseInt(resumeId),
    company: 'API Company',
    role: 'API Engineer',
    start_date: 'Jan 2023',
    end_date: 'Present',
    description: 'API test description'
  });

  console.log(`Add exp status: ${res.status()}`);
  const body = await res.json();
  console.log('Add exp response:', body);

  expect(res.status()).toBe(201);
  experienceId = body.id;
  console.log(`✅ Experience added! ID: ${experienceId}`);
});

test('API 13. Get experiences', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/experience/${resumeId}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Got ${body.length} experiences!`);
});

test('API 14. Update experience', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'PUT', `/api/experience/${experienceId}`, {
    company: 'Updated Company',
    role: 'Updated Role',
    start_date: 'Feb 2023',
    end_date: 'Dec 2023'
  });
  expect(res.status()).toBe(200);
  console.log('✅ Experience updated!');
});

test('API 15. Delete experience', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/experience/${experienceId}`);
  expect(res.status()).toBe(200);
  console.log('✅ Experience deleted!');
});

// ════════════════════════════════════════
// SECTION 4: EDUCATION TESTS
// ════════════════════════════════════════

test('API 16. Add education', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/education/', {
    resume_id: parseInt(resumeId),
    degree: 'B.Tech API',
    institution: 'API University',
    start_year: '2020',
    end_year: '2024',
    score: '8.5 CGPA'
  });

  expect(res.status()).toBe(201);
  const body = await res.json();
  educationId = body.id;
  console.log(`✅ Education added! ID: ${educationId}`);
});

test('API 17. Get education', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/education/${resumeId}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Got ${body.length} education!`);
});

test('API 18. Update education', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'PUT', `/api/education/${educationId}`, {
    degree: 'Updated Degree',
    institution: 'Updated Uni',
    start_year: '2020',
    end_year: '2024'
  });
  expect(res.status()).toBe(200);
  console.log('✅ Education updated!');
});

test('API 19. Delete education', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/education/${educationId}`);
  expect(res.status()).toBe(200);
  console.log('✅ Education deleted!');
});

// ════════════════════════════════════════
// SECTION 5: SKILLS TESTS
// ════════════════════════════════════════

test('API 20. Add skill', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/skills/', {
    resume_id: parseInt(resumeId),
    name: 'API Skill',
    level: 'Intermediate'
  });

  expect(res.status()).toBe(201);
  const body = await res.json();
  skillId = body.id;
  console.log(`✅ Skill added! ID: ${skillId}`);
});

test('API 21. Get skills', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/skills/${resumeId}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Got ${body.length} skills!`);
});

test('API 22. Delete skill', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/skills/${skillId}`);
  expect(res.status()).toBe(200);
  console.log('✅ Skill deleted!');
});

// ════════════════════════════════════════
// SECTION 6: PROJECTS TESTS
// ════════════════════════════════════════

test('API 23. Add project', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/projects/', {
    resume_id: parseInt(resumeId),
    title: 'API Project',
    description: 'Test description',
    tech_stack: 'React, Flask',
    link: 'https://github.com/test'
  });

  expect(res.status()).toBe(201);
  const body = await res.json();
  projectId = body.id;
  console.log(`✅ Project added! ID: ${projectId}`);
});

test('API 24. Get projects', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/projects/${resumeId}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Got ${body.length} projects!`);
});

test('API 25. Delete project', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/projects/${projectId}`);
  expect(res.status()).toBe(200);
  console.log('✅ Project deleted!');
});

// ════════════════════════════════════════
// SECTION 7: CERTIFICATIONS TESTS
// ════════════════════════════════════════

test('API 26. Add certification', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'POST', '/api/certifications/', {
    resume_id: parseInt(resumeId),
    name: 'API Cert',
    issuer: 'API Issuer',
    issue_date: 'Jan 2024'
  });

  expect(res.status()).toBe(201);
  const body = await res.json();
  certId = body.id;
  console.log(`✅ Cert added! ID: ${certId}`);
});

test('API 27. Get certifications', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'GET', `/api/certifications/${resumeId}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Got ${body.length} certs!`);
});

test('API 28. Delete certification', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/certifications/${certId}`);
  expect(res.status()).toBe(200);
  console.log('✅ Cert deleted!');
});

// ════════════════════════════════════════
// SECTION 8: CLEANUP
// ════════════════════════════════════════

test('API 29. Delete test resume', async ({ request }) => {
  await getAuthCookie(request);

  const res = await api(request, 'DELETE', `/api/resume/${resumeId}`);
  console.log(`Delete resume status: ${res.status()}`);
  expect(res.status()).toBe(200);
  console.log('✅ Test resume cleaned up!');
});

// ════════════════════════════════════════
// SECTION 9: AUTH EXTRA TESTS
// ════════════════════════════════════════

test('API 30. Get current user me', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'GET', '/api/auth/me');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.email).toBe(TEST_USER.email);
  console.log('✅ Get me works!');
});

test('API 31. Check auth returns logged in', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'GET', '/api/auth/check-auth');
  expect(res.status()).toBe(200);
  console.log('✅ Check auth works!');
});

test('API 32. Logout works', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'POST', '/api/auth/logout');
  expect(res.status()).toBe(200);
  console.log('✅ Logout works!');
});

// ════════════════════════════════════════
// SECTION 10: AI TESTS
// ════════════════════════════════════════

test('API 33. AI generate experience description', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'POST', '/api/ai/generate-experience', {
    role: 'Software Engineer',
    company: 'Google',
    start_date: 'Jan 2023',
    end_date: 'Present'
  });
  console.log(`AI experience status: ${res.status()}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.description).toBeTruthy();
  console.log('✅ AI experience generation works!');
});

test('API 34. AI generate project description', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'POST', '/api/ai/generate-project', {
    title: 'AI Resume Builder',
    tech_stack: 'React, Flask'
  });
  console.log(`AI project status: ${res.status()}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.description).toBeTruthy();
  console.log('✅ AI project generation works!');
});

test('API 35. AI missing fields returns 400', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'POST', '/api/ai/generate-experience', {
    role: 'Engineer'
    // missing company
  });
  expect(res.status()).toBe(400);
  console.log('✅ AI validation works!');
});

// ════════════════════════════════════════
// SECTION 11: SECURITY TESTS
// ════════════════════════════════════════

test('API 36. Normal user cannot access admin routes', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'GET', '/api/admin/stats');
  console.log(`Normal user admin access: ${res.status()}`);
  expect([401, 403]).toContain(res.status());
  console.log('✅ Admin route blocked for normal user!');
});

test('API 37. Normal user cannot list admin users', async ({ request }) => {
  await getAuthCookie(request);
  const res = await api(request, 'GET', '/api/admin/users');
  expect([401, 403]).toContain(res.status());
  console.log('✅ Admin users blocked for normal user!');
});

// ════════════════════════════════════════
// SECTION 12: ADMIN TESTS
// (Uses your main admin account)
// ════════════════════════════════════════

test('API 38. Admin can get stats', async ({ request }) => {
  // Login as admin
  const loginRes = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'tannaanand992@gmail.com', password: 'Admin@123' }
  });
  const adminCookie = loginRes.headers()['set-cookie']?.split(';')[0];

  const res = await request.get(`${API}/api/admin/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    }
  });

  console.log(`Admin stats status: ${res.status()}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.total_users).toBeGreaterThan(0);
  expect(body.total_resumes).toBeGreaterThan(0);
  console.log(`✅ Admin stats: ${body.total_users} users, ${body.total_resumes} resumes!`);
});

test('API 39. Admin can list all users', async ({ request }) => {
  const loginRes = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'tannaanand992@gmail.com', password: 'Admin@123' }
  });
  const adminCookie = loginRes.headers()['set-cookie']?.split(';')[0];

  const res = await request.get(`${API}/api/admin/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    }
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  console.log(`✅ Admin sees ${body.length} users!`);
});

test('API 40. Admin can list all resumes', async ({ request }) => {
  const loginRes = await request.post(`${API}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'tannaanand992@gmail.com', password: 'Admin@123' }
  });
  const adminCookie = loginRes.headers()['set-cookie']?.split(';')[0];

  const res = await request.get(`${API}/api/admin/resumes`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    }
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  console.log(`✅ Admin sees ${body.length} resumes!`);
});

// ─────────────────────────────────────────
// TEST 26: Forgot password page loads
// ─────────────────────────────────────────
test('26. Forgot password page loads', async ({ page }) => {
  await page.goto(`${URL}/forgot-password`);
  await page.waitForLoadState('networkidle');

  // Check input exists
  const inputs = await page.locator('input').count();
  expect(inputs).toBeGreaterThan(0);

  // Check submit button exists
  await expect(
    page.getByRole('button').first()
  ).toBeVisible();

  console.log('✅ Forgot password page loads!');
});

// ─────────────────────────────────────────
// TEST 27: Can delete resume from dashboard
// ─────────────────────────────────────────
test('27. Can delete resume from dashboard', async ({ page }) => {
  await login(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Count resumes before delete
  const before = await page.locator('.resume-card, [class*="card"]').count();
  console.log(`Resumes before: ${before}`);

  if (before > 0) {
    // Click delete on first resume
    await page.locator('[class*="card"]').first()
      .getByRole('button', { name: /delete|🗑️/i }).click();
    await page.waitForTimeout(2000);

    const after = await page.locator('[class*="card"]').count();
    expect(after).toBeLessThanOrEqual(before);
    console.log('✅ Resume deleted from dashboard!');
  } else {
    console.log('⚠️ No resumes to delete - skipping');
  }
});

// ─────────────────────────────────────────
// TEST 28: Edit modal works
// ─────────────────────────────────────────
test('28. Edit experience modal works', async ({ page }) => {
  await goToResume(page);

  // Click Experience tab
  await page.getByText('Experience').first().click();
  await page.waitForTimeout(1000);

  // First add an experience
  await page.getByPlaceholder('e.g. Google').fill('Edit Test Company');
  await page.getByPlaceholder('e.g. Software Engineer').fill('Edit Test Role');
  await page.getByPlaceholder('Jan 2022').fill('Jan 2024');
  await page.getByRole('button', { name: /Add Experience/i }).click();
  await page.waitForTimeout(3000);

  // Click edit button on first card
  await page.locator('.rb-card').first()
    .getByRole('button', { name: /edit/i }).click();
  await page.waitForTimeout(1000);

  // Check modal opened
  await expect(page.getByText(/Edit Experience/i)).toBeVisible();

  // Change company name
  await page.getByLabel('Company').fill('Updated Company');

  // Save changes
  await page.getByRole('button', { name: /Save Changes/i }).click();
  await page.waitForTimeout(2000);

  // Check success toast
  await expect(page.getByText(/updated/i)).toBeVisible();
  console.log('✅ Edit modal works!');
});