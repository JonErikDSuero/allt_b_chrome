chrome.commands.onCommand.addListener(function(command) {
  if (command == "bookmark_through_keyboard") {
    bookmark("through_keyboard"); // pass an arbitrary value
  }
});


chrome.contextMenus.create({
  title: "Alt B",
  contexts:["all"],
  onclick: bookmark
});


function bookmark(info) {

  chrome.tabs.getSelected(null, function(tab) {

    chrome.bookmarks.search({url: tab.url}, function(similar_bookmarks){

      if (similar_bookmarks.length == 0) { // if the current page is not yet bookmarked, allow bookmarking
        var tag_raw = ((info.selectionText == undefined) ? tab.title : info.selectionText);
        tag_raw = tag_raw.toLowerCase().replace(/[^A-Za-z ]/g,'');
        var url = tab.url;

        chrome.bookmarks.getTree( function(bookmarks_tree_root) {
          var children_of_bookmarks_bar = bookmarks_tree_root[0].children[0];
          var folders = [];
          var folders = get_folders(children_of_bookmarks_bar, folders);
          var best_folder = get_best_folder(folders, tag_raw);
          
          chrome.bookmarks.create({
            'parentId': best_folder.id,
            title: tab.title,
            url: url
          });

        });
      }
    });
  });
}


function get_folders(tree_node, folders) {
  if (tree_node.children != undefined) { // if it is a folder
    var i;
    var children = tree_node.children;

    for (i = 0; i < children.length; i++) {
      get_folders(children[i], folders);
    }

    folders.push(tree_node);
  }
  return folders;
}


function get_best_folder(folders, tag_raw) { // TODO: improve by adding back-end server?
  var i;
  for (i = 0; i < folders.length; i++) {
    folder_title = folders[i].title.toLowerCase().replace(/[^A-Za-z ]/g,'');
    if (tag_raw.indexOf(folder_title) > -1) {
      return folders[i];
    }
  }
  return folders[folders.length-1];
}