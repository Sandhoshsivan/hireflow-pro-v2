// ── HireFlow Pro Background Service Worker ──────────────────────────────────

const DEFAULT_API_URL = 'http://localhost:5062';

// Get API URL from storage
async function getApiUrl() {
  const data = await chrome.storage.local.get('apiUrl');
  return data.apiUrl || DEFAULT_API_URL;
}

// Get auth token from storage
async function getToken() {
  const data = await chrome.storage.local.get('token');
  return data.token || null;
}

// Send scraped job to HireFlow API
async function saveJob(jobData) {
  const apiUrl = await getApiUrl();
  const token = await getToken();

  if (!token) {
    return { success: false, error: 'Not logged in. Open the extension popup to sign in.' };
  }

  try {
    const response = await fetch(`${apiUrl}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        company: jobData.company || 'Unknown Company',
        role: jobData.role || 'Unknown Role',
        status: 'Saved',
        source: jobData.source || 'LinkedIn',
        location: jobData.location || '',
        salary: jobData.salary || '',
        jobUrl: jobData.jobUrl || '',
        notes: jobData.description ? jobData.description.substring(0, 500) : '',
        dateApplied: new Date().toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.error === 'upgrade_required') {
        return { success: false, error: 'Upgrade to Pro for unlimited job tracking!' };
      }
      return { success: false, error: data.error || 'Failed to save job' };
    }

    const result = await response.json();
    return { success: true, id: result.id, message: 'Job saved to HireFlow Pro!' };
  } catch (err) {
    return { success: false, error: 'Cannot connect to HireFlow Pro. Is the server running?' };
  }
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_JOB') {
    saveJob(message.data).then(sendResponse);
    return true; // async response
  }

  if (message.type === 'LOGIN') {
    loginUser(message.email, message.password).then(sendResponse);
    return true;
  }

  if (message.type === 'CHECK_AUTH') {
    getToken().then(token => sendResponse({ loggedIn: !!token }));
    return true;
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.local.remove(['token', 'user']);
    sendResponse({ success: true });
  }
});

async function loginUser(email, password) {
  const apiUrl = await getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }
    await chrome.storage.local.set({
      token: data.token,
      user: { name: data.name, email: data.email },
    });
    return { success: true, user: { name: data.name, email: data.email } };
  } catch (err) {
    return { success: false, error: 'Cannot connect to HireFlow Pro server' };
  }
}
