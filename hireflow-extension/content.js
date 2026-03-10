// ── HireFlow Pro Content Script — Job Page Scraper ──────────────────────────

(function () {
  'use strict';

  // Detect which site we're on
  const hostname = window.location.hostname;

  function scrapeLinkedIn() {
    const company =
      document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.textContent?.trim() ||
      document.querySelector('.topcard__org-name-link')?.textContent?.trim() ||
      document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]')?.textContent?.trim() ||
      '';

    const role =
      document.querySelector('.job-details-jobs-unified-top-card__job-title h1')?.textContent?.trim() ||
      document.querySelector('.topcard__title')?.textContent?.trim() ||
      document.querySelector('.t-24.t-bold')?.textContent?.trim() ||
      '';

    const location =
      document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim() ||
      document.querySelector('.topcard__flavor--bullet')?.textContent?.trim() ||
      '';

    const salary =
      document.querySelector('.salary-main-rail__data-amount')?.textContent?.trim() ||
      document.querySelector('[class*="compensation"]')?.textContent?.trim() ||
      '';

    const description =
      document.querySelector('.jobs-description__content')?.textContent?.trim() ||
      document.querySelector('.description__text')?.textContent?.trim() ||
      '';

    return {
      company,
      role,
      location,
      salary,
      description: description.substring(0, 1000),
      source: 'LinkedIn',
      jobUrl: window.location.href,
    };
  }

  function scrapeIndeed() {
    const company =
      document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ||
      document.querySelector('.jobsearch-InlineCompanyRating-companyHeader')?.textContent?.trim() ||
      '';

    const role =
      document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() ||
      document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
      '';

    const location =
      document.querySelector('[data-testid="inlineHeader-companyLocation"]')?.textContent?.trim() ||
      document.querySelector('.jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() ||
      '';

    const salary =
      document.querySelector('#salaryInfoAndJobType')?.textContent?.trim() ||
      '';

    const description =
      document.querySelector('#jobDescriptionText')?.textContent?.trim() ||
      '';

    return {
      company,
      role,
      location,
      salary,
      description: description.substring(0, 1000),
      source: 'Indeed',
      jobUrl: window.location.href,
    };
  }

  function scrapeGlassdoor() {
    const company =
      document.querySelector('[data-test="employerName"]')?.textContent?.trim() ||
      '';

    const role =
      document.querySelector('[data-test="jobTitle"]')?.textContent?.trim() ||
      '';

    const location =
      document.querySelector('[data-test="location"]')?.textContent?.trim() ||
      '';

    const salary =
      document.querySelector('[data-test="detailSalary"]')?.textContent?.trim() ||
      '';

    const description =
      document.querySelector('.jobDescriptionContent')?.textContent?.trim() ||
      '';

    return {
      company,
      role,
      location,
      salary,
      description: description.substring(0, 1000),
      source: 'Glassdoor',
      jobUrl: window.location.href,
    };
  }

  function scrapeCurrentPage() {
    if (hostname.includes('linkedin.com')) return scrapeLinkedIn();
    if (hostname.includes('indeed.com')) return scrapeIndeed();
    if (hostname.includes('glassdoor.com')) return scrapeGlassdoor();
    return null;
  }

  // Inject floating "Save to HireFlow" button
  function injectSaveButton() {
    if (document.getElementById('hireflow-save-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'hireflow-save-btn';
    btn.innerHTML = '🚀 Save to HireFlow';
    btn.addEventListener('click', async () => {
      const jobData = scrapeCurrentPage();
      if (!jobData || (!jobData.company && !jobData.role)) {
        btn.textContent = 'No job data found';
        btn.style.background = '#ef4444';
        setTimeout(() => resetButton(), 2000);
        return;
      }

      btn.textContent = 'Saving...';
      btn.disabled = true;

      chrome.runtime.sendMessage({ type: 'SAVE_JOB', data: jobData }, (response) => {
        if (response?.success) {
          btn.textContent = 'Saved!';
          btn.style.background = '#059669';
        } else {
          btn.textContent = response?.error || 'Failed';
          btn.style.background = '#ef4444';
        }
        setTimeout(() => resetButton(), 3000);
      });
    });

    function resetButton() {
      btn.innerHTML = '🚀 Save to HireFlow';
      btn.style.background = '#2563eb';
      btn.disabled = false;
    }

    document.body.appendChild(btn);
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCRAPE_PAGE') {
      const data = scrapeCurrentPage();
      sendResponse(data);
    }
  });

  // Wait for page to load then inject
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSaveButton);
  } else {
    setTimeout(injectSaveButton, 1500);
  }
})();
