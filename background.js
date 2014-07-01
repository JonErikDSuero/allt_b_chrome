chrome.commands.onCommand.addListener(function(command) {
  if (command == "bookmark_through_keyboard") {
    detectCurrentTab(); // pass an arbitrary value
  }
});


chrome.contextMenus.create({
  title: "Alt B",
  contexts:["all"],
  onclick: detectCurrentTab
});


chrome.tabs.onActivated.addListener(function(activeInfo) { //listen for new tab to be activated
  detectCurrentTab("do_not_bookmark");
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { //listen for current tab to be changed
  detectCurrentTab("do_not_bookmark");
});


function toggleBookmarkedIcon(bookmarked) {
  var icon_path = ((bookmarked) ? 'heart_icon.png' : 'icon.png');
  chrome.browserAction.setIcon({path: icon_path});
}


function detectCurrentTab(info) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.bookmarks.search({url: tab.url}, function(similar_bookmarks){
      var current_tab_is_bookmarked = (similar_bookmarks.length != 0);

      if (info == "do_not_bookmark") {
        toggleBookmarkedIcon(current_tab_is_bookmarked);
      } else {
        if (!current_tab_is_bookmarked) {
          toggleBookmarkedIcon(true);
          bookmark(tab, info);
        }
      }
    });
  });
}


function bookmark(tab, info) {
  var url = tab.url;
  var tag_raw = (((info == undefined) || (info.selectionText == undefined)) ? tab.title : info.selectionText);
  tag_raw = tag_raw.toLowerCase().replace(/[^A-Za-z ]/g,'');

  chrome.bookmarks.getTree( function(bookmarks_tree_root) {
    var children_of_bookmarks_bar = bookmarks_tree_root[0].children[0];
    var folders = [];
    var folders = getFolders(children_of_bookmarks_bar, folders);
    var best_folder = getBestFolder(folders, tag_raw);
    
    chrome.tabs.executeScript(tab.id, {code: "var folder_title = '"+best_folder.title+"';"}, function() {
      chrome.tabs.executeScript(tab.id, {file: 'jquery-2.1.1.min.js'}, function() {
        chrome.tabs.executeScript(tab.id, {file: 'bookmarked_modal.js'});
      });
    });

    chrome.bookmarks.create( { 'parentId': best_folder.id, title: tab.title, url: url } );
  });
}


function getFolders(tree_node, folders) {
  if (tree_node.children != undefined) { // if it is a folder
    var i;
    var children = tree_node.children;

    for (i = 0; i < children.length; i++) {
      getFolders(children[i], folders);
    }

    folders.push(tree_node);
  }
  return folders;
}


function getBestFolder(folders, tag_raw) { // TODO: improve by adding back-end server?
  var i;
  for (i = 0; i < folders.length; i++) {
    folder_title = folders[i].title.toLowerCase().replace(/[^A-Za-z ]/g,'');
    if (tag_raw.indexOf(folder_title) > -1) {
      return folders[i];
    }
  }
  return folders[folders.length-1];
}