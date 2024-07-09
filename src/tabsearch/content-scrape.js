

export default function (request, sender, sendResponse) {
    if (request.type == "inputSearch") {
      console.log(request.title);
    }

    if (request.type == "getHTML") {
      var { tabId, title, favIconUrl } = request;

      //TODO strip HTML of tags
      var content =
        title +
        " " +
        request.content
          .replace(/\r?\n|\r/g, " ")
          .replace(/<style(.|\n)+?\/style>/gi, "")
          .replace(/<noscript(.|\n)+?\/noscript>/gi, "")
          .replace(/<script(.|\n)+?\/script>/gi, "")
          .replace(/<(.|\n)+?>/gi, " ");

      //delete from tab display if already listed
      if (results?.map((x) => x.id).indexOf(tabId) > -1) {
        // return;
        results.splice(content?.map((x) => x.id).indexOf(tabId), 1);
      }

      //search to find all words in tab content
      var foundAllWords = true;
      var searchSplit = searchText.trim().split(" ");

      for (var i in searchSplit)
        if (searchSplit[i].length > 0)
          if (content.toLowerCase().indexOf(searchSplit[i]) == -1)
            foundAllWords = false;

      //quit if all words not found
      if (!foundAllWords) return;

      let lastSearchWord = searchSplit[searchSplit.length - 1];

      //create title
      if (title.length > 45) title = title.substr(0, 45) + "&hellip;";

      //create snippet substring
      let indexStartWord = content.toLowerCase().indexOf(lastSearchWord);
      let indexEndWord = indexStartWord + lastSearchWord.length;

      let snippetTextSize = 100;

      let dispString =
        content.substring(
          Math.max(indexStartWord - snippetTextSize, 0),
          indexStartWord
        ) +
        "<b>" +
        content.substring(indexStartWord, indexEndWord) +
        "</b>" +
        content.substring(indexEndWord, indexEndWord + snippetTextSize);

      console.log(dispString);

      var resultObj = {
        dispString,
        id: tabId,
        title,
        favIconUrl,
        lastSearchWord,
      };

      results.push(resultObj);

      //needed to make []{} reactive
      results = results;
    }
  }