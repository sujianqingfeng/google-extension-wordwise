console.log('start');

chrome.browserAction.onClicked.addListener(
  ()=>{
    console.log('------click');
    
  }
)
// chrome.browserAction.onClicked.addListener(()=>{
//   console.log('------back');
  
//   chrome.runtime.sendMessage({type: 'openOptionsPage'})
// })