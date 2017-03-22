// ==UserScript==
// @name         Tumblr Follower Details
// @version      0.1
// @description  More details on the details of your follower's activity.
// @author       Yves St. Germain
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @include      https://www.tumblr.com/blog/*/followers
// @include      https://www.tumblr.com/blog/*/followers/
// @include      https://www.tumblr.com/blog/*/followers/*
// ==/UserScript==

(function()
{
  'use strict';

  var blogList = document.getElementsByClassName("name-link");
  var api_key = "INSERT YOUR API KEY HERE PLEASE";

  function appendInfo(info, posts)
  {
    var blogInfoContainer = document.createElement("div");
    var blogInfoTable = document.createElement("table");

    var postRow = document.createElement("tr");

    $(blogInfoContainer).css(
    {
      "border-radius": "25px",
      "padding": "10px",
      "background-color": "#E8E8E8",
      "color": "#525252"
    });

    $(blogInfoTable).css(
    {
      "width": "100%"
    });
    var postCountBox = document.createElement("td");
    var postCountText = document.createTextNode(info.posts + " Posts");
    postCountBox.appendChild(postCountText);
    postRow.appendChild(postCountBox);

    var nsfwBox = document.createElement("td");
    var nsfwText;
    if (info.is_nsfw)
    {
      nsfwText = document.createTextNode("NSFW");
      nsfwBox.style.color = "red";
    }
    else
    {
      nsfwText = document.createTextNode("SFW");
      nsfwBox.style.color = "green";
    }
    nsfwBox.align = "right";
    nsfwBox.appendChild(nsfwText);
    postRow.appendChild(nsfwBox);
    blogInfoTable.append(postRow);

    var timeRow = document.createElement("tr");

    var updatedBox = document.createElement("td");
    var date = new Date(info.updated * 1000);
    var month = date.getMonth() + 1;
    var updatedText = document.createTextNode("Updated: " + month + "/" + date.getDate() + "/" + date.getFullYear());
    updatedBox.appendChild(updatedText);
    timeRow.appendChild(updatedBox);

    var freqBox = document.createElement("td");
    var oldest = new Date(posts[posts.length - 1].timestamp * 1000);
    var now = new Date();
    var difference = Math.floor((oldest - now) / (1000 * 60 * 60 * 24));
    var freq = 0;
    var freq_text;


    if (difference > -2)
    {
      difference = Math.abs(oldest - now) / 36e5;
      if (difference <= 1)
      {
        freq_text = document.createTextNode("20/post hour");
      }
      else
      {
        freq = Math.round(((24 / difference) * 100) / 100);
        freq_text = document.createTextNode(freq + "/post hour");
      }

    }
    else if (difference > -7)
    {
      freq = Math.round((20 / Math.abs(difference)) * 100) / 100;
      freq_text = document.createTextNode(freq + "/post day");
    }
    else if (difference > -30)
    {
      difference = Math.floor((oldest - now) / (24 * 3600 * 1000 * 7));
      freq = Math.round((20 / Math.abs(difference)) * 100) / 100;
      freq_text = document.createTextNode(freq + "/post week");
    }
    else if (difference > -365)
    {
      var d1Y = now.getFullYear();
      var d2Y = oldest.getFullYear();
      var d1M = now.getMonth();
      var d2M = oldest.getMonth();
      difference = Math.floor((d2M + 12 * d2Y) - (d1M + 12 * d1Y));
      freq = Math.round((20 / Math.abs(difference)) * 100) / 100;
      freq_text = document.createTextNode(freq + "/post month");
    }
    else
    {
      difference = oldest.getFullYear() - now.getFullYear();
      freq = Math.round((20 / Math.abs(difference)) * 100) / 100;
      freq_text = document.createTextNode(freq + "/post year");

    }
    freqBox.appendChild(freq_text);
    freqBox.align = "right";
    timeRow.appendChild(freqBox);

    blogInfoTable.appendChild(timeRow);

    blogInfoContainer.appendChild(blogInfoTable);

    var tags = {};
    var types = {
      "text": 0,
      "quote": 0,
      "link": 0,
      "answer": 0,
      "video": 0,
      "audio": 0,
      "photo": 0,
      "chat": 0
    };
    posts.forEach(function(p, index, array)
    {
      types[p.type] += 1;
      p.tags.forEach(function(t, index, array)
      {
        if (!tags.hasOwnProperty(t.toLowerCase()))
        {
          tags[t.toLowerCase()] = 1;
        }
        else
        {
          tags[t.toLowerCase()] += 1;
        }

      });

    });
    var typeBox = document.createElement("div");
    $(typeBox).css(
    {
      "margin": "3px",
      "text-align": "center",
      "color": "#7A7A7A"
    });
    for (var ty in types)
    {
      var ty_count = types[ty];
      if (ty_count > 0)
      {
        var ty_text = document.createTextNode(ty + ": " + ty_count + " ");
        typeBox.appendChild(ty_text);
      }
    }
    blogInfoContainer.appendChild(typeBox);


    if (!$.isEmptyObject(tags))
    {
      var tagBox = document.createElement("div");
      $(tagBox).css(
      {
        "margin": "3px",
        "text-align": "center",
        "color": "#9E9E9E"
      });
      for (var t in tags)
      {
        var t_count = tags[t];
        var t_text = document.createTextNode("#" + t + " ");
        var tag_span = document.createElement("span");
        tag_span.appendChild(t_text);
        var font_size = "70%";
        var font_color = "#7D7D7D";
        if (t_count > 10)
        {
          font_size = "100%";
          font_color = "#141414";
        }
        else if (t_count > 5)
        {
          font_size = "90%";
          font_color = "#424242";
        }
        else if (t_count > 1)
        {
          font_size = "80%";
          font_color = "#595959";
        }
        $(tag_span).css(
        {
          "font-size": font_size,
          "color": font_color,
          "margin": "1px"
        });
        tagBox.appendChild(tag_span);
      }
      blogInfoContainer.appendChild(tagBox);
    }


    var node = $("[data-user-name='" + info.name + "']")[0];
    $(blogInfoContainer).insertAfter(node);
  }

  for (var i = 0; i < blogList.length; i++)
  {
    $.ajax(
    {
      method: "GET",
      url: "https://api.tumblr.com/v2/blog/" + blogList[i].host + "/posts?api_key=" + api_key,
      dataType: "jsonp",
      success: function(data)
      {
        appendInfo(data.response.blog, data.response.posts);
      }
    });
  }
})();
