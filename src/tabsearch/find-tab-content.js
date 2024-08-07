
export default function findInTabContent(request, searchText) {
    
  var { tabId, title, favIconUrl, content } = request;

  //TODO strip HTML of tags
  content =
    title +
    " " +
    content
      .replace(/\r?\n|\r/g, " ")
      .replace(/<style(.|\n)+?\/style>/gi, "")
      .replace(/<noscript(.|\n)+?\/noscript>/gi, "")
      .replace(/<script(.|\n)+?\/script>/gi, "")
      .replace(/<(.|\n)+?>/gi, " ");


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


  return {
    dispString,
    id: tabId,
    title,
    favIconUrl,
    lastSearchWord,
  };
}