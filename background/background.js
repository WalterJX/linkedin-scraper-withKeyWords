chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "job") {
    chrome.storage.local.get('jobs', function (result) {
      const existingJobs = result.jobs || [];

      if (!jobIdExists(message.message.linkedinJobId, existingJobs)
          && keyWordsFilterSucceed(message.message.jobTitle)) {
        // if (keyWordsFilterSucceed(message.message.jobTitle)) {
        const newJobs = [...existingJobs, message.message];
        chrome.storage.local.set({ jobs: newJobs });
      }
    });
  }
});

function jobIdExists(jobId, existingJobs) {
  for(let index in existingJobs) {
    if(jobId == existingJobs[index].linkedinJobId) {
      return true;
    }
  }
  return false;
}

function keyWordsFilterSucceed(jobName) {
  //must contain at least ONE word of the following list
  const mustHaveWords = ["software", "back end", "back-end", "backend", "full stack", "full-stack",
    "fullstack", "application", "java", "developer", "cloud", "platform"];
  //must NOT contain any of the words in the following list
  const exclusiveWords = ["clearance", "principal", "support", "test", "front end", "front-end",
    "frontend", "devops", "staff", "citizenship", "contract", "embedded", "manager", "hard ware", "hardware",
    "director"];
  const exclusiveCaseSensitiveWords = ["iOS"];

  let lowerCaseJobName = jobName.toLowerCase();
  let result = false;

  console.log("job name: " + lowerCaseJobName);

  for (let index in mustHaveWords) {
    if (lowerCaseJobName.includes(mustHaveWords[index])) {
      console.log("include keyword: " + mustHaveWords[index]);
      result = true;
      break;
    }
  }

  //console.log("pass mustHave? " + result);

  if (!result) {
    return false;
  }

  for (let index in exclusiveCaseSensitiveWords) {
    if (jobName.includes(exclusiveCaseSensitiveWords[index])) {
      return false;
    }
  }

  for(let index in exclusiveWords) {
    if (lowerCaseJobName.includes(exclusiveWords[index])) {
      //console.log("should not include word but has: " + exclusiveWords[index]);
      return false;
    }
  }

  //console.log("pass exclusive? true!!!");

  return true;
}