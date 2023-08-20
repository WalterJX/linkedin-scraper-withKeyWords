document.addEventListener("DOMContentLoaded", function () {
  let table;

  initializeDataTable();

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local" && changes.jobs) {
      loadJobsTable();
    }
  });

  function initializeDataTable() {
    table = $("#jobsTable").DataTable({
      paging: false,
      searching: true,
      info: true,
    });

    loadJobsTable();
  }

  function loadJobsTable() {
    chrome.storage.local.get("jobs", function (result) {
      const jobs = result.jobs;

      if (jobs && jobs.length > 0) {
        // Clear existing table rows
        const tableBody = document.getElementById("jobsTableBody");
        table.clear().draw();

        // Create table rows from the jobs data
        jobs.forEach(function (job) {
          table.row
            .add([
              '<input type="checkbox">', // Checkbox cell
              job.linkedinJobId,
              job.companyName,
              `<a href="${job.link}">${job.jobTitle}</a>`,
            ])
            .draw();
        });

        // Update the title with the count of jobs
        document.getElementById(
          "pageTitle"
        ).innerText = `LinkedIn Job (${jobs.length})`;
      }
    });
  }
});

document
  .getElementById("clearLocalStorageButton")
  .addEventListener("click", function () {
    chrome.storage.local.remove("jobs", function () {
      // Handle the removal of "jobs" from chrome.storage.local
      console.log("Jobs data removed from chrome.storage.local");
      location.reload(); // Reload the page
    });
  });

document
    .getElementById("sendToLocalDbButton")
    .addEventListener("click", function () {
      chrome.storage.local.get('jobs', function (result) {
        const existingJobs = result.jobs || [];

        if (existingJobs.length > 0) {
          fetch('http://localhost:8000/write-to-db/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(existingJobs)
          })
              .then(response => response.text())
              .then(text => {
                console.log('Server response:', text);
              })
              .catch(error => {
                console.error('Error:', error);
              });
        }
      });
    });
