// Keyboard
chrome.commands.onCommand.addListener(function(command) {
  if (command == "bookmark_through_keyboard") {
    detectCurrentTab();
  }
});

//Right Click
chrome.contextMenus.create({
  title: "Alt Bookmark",
  contexts:["all"],
  onclick: detectCurrentTab
});

//Icon Click
chrome.browserAction.onClicked.addListener( function(tab) {
  detectCurrentTab();
});

//New Tab Activated
chrome.tabs.onActivated.addListener( function(activeInfo) {
  detectCurrentTab("do_not_bookmark");
});

//Current Tab Changed
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
  detectCurrentTab("do_not_bookmark");
});




function toggleBookmarkedIcon(bookmarked) {
  var icon_path = ((bookmarked) ? 'images/heart_on.png' : 'images/heart_off.png');
  chrome.browserAction.setIcon({path: icon_path});
}


function detectCurrentTab(info_from_trigger) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.bookmarks.search({url: tab.url}, function(similar_bookmarks){
      var current_tab_is_bookmarked = (similar_bookmarks.length != 0);

      if (info_from_trigger == "do_not_bookmark") {
        toggleBookmarkedIcon(current_tab_is_bookmarked);
      } else {
        if (!current_tab_is_bookmarked) {
          toggleBookmarkedIcon(true);
          bookmark(tab, info_from_trigger);
        } else {
          toggleBookmarkedIcon(false);
          chrome.bookmarks.remove(similar_bookmarks[0].id);
        }
      }
    });
  });
}


function bookmark(tab, info_from_trigger) {
  var url = tab.url;

  chrome.bookmarks.getTree( function(bookmarks_tree_root) {
    var children_of_bookmarks_bar = bookmarks_tree_root[0].children[0];
    var folders = []
    getBestFolder(getFolders(children_of_bookmarks_bar, folders), tab, info_from_trigger, function(best_folder) {

      chrome.tabs.executeScript(tab.id, {code: "var folder_title = '"+best_folder.title+"';"}, function() {
        chrome.tabs.executeScript(tab.id, {file: 'jquery-2.1.1.min.js'}, function() {
          chrome.tabs.executeScript(tab.id, {file: 'bookmarked_modal.js'});
        });
      });

      chrome.bookmarks.create( { 'parentId': best_folder.id, title: tab.title, url: url } );
    });
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


function getBestFolder(folders, tab, info_from_trigger, cb) { // TODO: improve by adding back-end server?
  var info_raw = (((info_from_trigger == undefined) || (info_from_trigger.selectionText == undefined)) ? tab.title : info_from_trigger.selectionText);

  $.ajax({
    type: "POST",
    url: "http://localhost:3000/links/create",
    data: { name: tab.title, extra_info: info_raw, url: tab.url },
    folders: folders
  }).done(function(data) {
    var i;
    var best_folder = this.folders[folders.length-1]; // set "Bookmarks Bar" as "Default"
    for (i = 0; i < folders.length; i++) {
      if (this.folders[i].title == data.d.folder_name) {
        best_folder = this.folders[i];
      }
    }
    cb(best_folder);
  }).fail(function(error, status)  {
    // handle errors later
  });
}
