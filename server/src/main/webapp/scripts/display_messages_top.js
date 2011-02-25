/*
 Licensed to the Apache Software Foundation (ASF) under one   *
 or more contributor license agreements.  See the NOTICE file *
 distributed with this work for additional information        *
 regarding copyright ownership.  The ASF licenses this file   *
 to you under the Apache License, Version 2.0 (the            *
 "License"); you may not use this file except in compliance   *
 with the License.  You may obtain a copy of the License at   *
                                                              *
   http://www.apache.org/licenses/LICENSE-2.0                 *
                                                              *
 Unless required by applicable law or agreed to in writing,   *
 software distributed under the License is distributed on an  *
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY       *
 KIND, either express or implied.  See the License for the    *
 specific language governing permissions and limitations      *
 under the License.                                           * 
*/

// <![CDATA[
/*
 * displayMessages called by lift:comet, type="Timeline" and type="PublicTimeline"
 */

function msgDateCompare(msg1, msg2)
{
  return parseInt(msg1.message.when) - parseInt(msg2.message.when);
}

// Replaces all instances of the given substring.
String.prototype.replaceAll = function( 
	strTarget, // The substring you want to replace
	strSubString // The string you want to replace in.
	){
	var strText = this;
	var intIndexOfMatch = strText.indexOf( strTarget );
	 
	// Keep looping while an instance of the target string
	// still exists in the string.
	while (intIndexOfMatch != -1){
		// Relace out the current instance.
		strText = strText.replace( strTarget, strSubString )
		 
		// Get the index of any next matching substring.
		intIndexOfMatch = strText.indexOf( strTarget );
	}
	 
	// Return the updated string with ALL the target strings
	// replaced out with the new substring.
	return( strText );
} 


function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

function searchMe()
{
   if(document.forms["validateForm"].term.value.trim.length > 0)
   	document.forms["validateForm"].submit();
}    

var resendFunction = function(id){
  resend_msg(id);
  clearResend("resend_" + id );
}      

var currentConvNumber = 0;

function setReplyTo(id, text, msgPool, author){
    currentConvNumber = id;
     jQuery('#vMsg').focus();
    document.getElementById('reply-to-div').style.display = "block";
    if (author.length > 0) {
      jQuery('#message_request').html("Reply to: " + author);
    } else {
      jQuery('#message_request').html("Reply to conversation");
    }
    var rep_msg = text 
    if (text.length > 50)
     rep_msg = text.substr(0, 47) + "..."
    jQuery('#reply-to-span').html(rep_msg);
    if (author.length > 0) {
      jQuery('#vMsg').val("@" + author + " ")	
    }
    jQuery('#vMsg').focus();
    setCaretToPos(jQuery('#vMsg'), jQuery('#vMsg').val.length);
    jQuery('#vPool').val(msgPool);
   
}

function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
    
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

function clearReplyTo(){
  currentConvNumber = 0;
  document.getElementById('reply-to-div').style.display = "none";
  jQuery('#vPool').val(0);
  jQuery('#message_request').html('What are you working on?');
}           

function clearResend(id){
    document.getElementById(id).style.display = "none"
}                            

function clearMessages(elementId) {
  jQuery('.updates-box').not("#message").remove(); 
}

function parseXml(xml) {
    if (jQuery.browser.msie) {
    	  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.loadXML(xml);
           xml = xmlDoc;    
      }       
  return xml;
}

function pathAdjust (targetPath) {
	
   var targetPathTemp = targetPath;
   
    if (window.location.pathname == "/") 
      	  targetPathTemp = targetPath;
      else {
      	 if (relative_root_path== "./")
      	   targetPathTemp = window.location.pathname + "/"  + targetPath; 
      	else 
      	    targetPathTemp = window.location.pathname + "/" +  relative_root_path  + targetPath; 
      } 
   
   return targetPathTemp;
	
}


function displayMessages(msgArray, elementId)
{
	

	
 // Select the first element in table id="timeline_messages"
  //  with id="message" as the message template
  if (msgTemplate == null) {
    //                                    var msgTemplate = jQuery('span.'+spanId+' message:first');
    var msgTemplate = jQuery('#'+elementId+' #message:first');
    var tagTemplate = msgTemplate.find('#tag:first');
    var msgInsertPt = jQuery('#'+elementId);

    // Now we have the template, make the existing instances invisible
    jQuery('#'+elementId+' *[id=message]').hide();
  }

  // Sort the messages into date order
  msgArray.sort(msgDateCompare);

  for (var msgIndex in msgArray)
  {
    // Marshall the data from the Comet-supplied message
    var cometMsg = msgArray[msgIndex].message;
    var cometReason = msgArray[msgIndex].reason;
    var cometResent = msgArray[msgIndex].resent;
    var msgId = "message_"+cometMsg.id;

    // Only do this if the message is not already in the table
    if (jQuery('#'+elementId+' #'+msgId).size() == 0)
    {
      var msgAuthor = cometMsg.author;
      var msgBody = null;
      
      // Dealing with an IE bug when parsing XML with jQuery
      
      if (jQuery.browser.msie) {
      	var msgBodyXML = parseXml(cometMsg.text);
        var msgBodyBase = jQuery(msgBodyXML).find('body');
        msgBody = msgBodyBase[0].xml.replaceAll ("<body>", "").replaceAll ("</body>", ""); 
      }
      else
      	msgBody = jQuery(cometMsg.text).find('body').html();
      	
      var msgDateObj = new Date(parseInt(cometMsg.when));
      
      if (!msgBody)
      	msgBody = cometMsg.text;
      
      var msgDateStr = prettyDate(msgDateObj);
      

      
      var msgPool = '';
      if (cometMsg.pool) msgPool = 'in pool \'' + cometMsg.pool.name + "\'"; 
      var msgPoolId = 0;
      if (cometMsg.pool) msgPoolId = cometMsg.pool.id; 
      var msgSource = cometMsg.source;
      var msgConversation = cometMsg.conversation;
      var msgReason = ""
      for (r in cometReason) {
      	msgSource = ""
        if (r == "resent_from")
          msgReason = "resent by " + cometReason[r].nickname;
        else
          msgReason = "caused by " + r;
        break
      }
      var msgTags = jQuery(cometMsg.text).find('tags > tag').get();
      for (var tagIndex=0; tagIndex < msgTags.length; tagIndex++) {
        // Replace each tag element with the plain tag text
        msgTags[tagIndex] = jQuery(msgTags[tagIndex]).attr('name');
      }

      // Put the marshalled data into a copy of the template
      var newMsg = msgTemplate.clone(true).attr('id',msgId);

      
      newMsg.find('.author').text(msgAuthor.nickname);     
            
     newMsg.find('.author').attr('href',pathAdjust("user/" + msgAuthor.nickname) );
     
     
   
      // Dealing with users with no avatars
      if (!msgAuthor.imageUrl) {
      	 msgAuthor.imageUrl= pathAdjust( "images/avatar.jpg"); 
     }
     
     	
     if (!msgPool)
      	msgPool="public"
      	
      var avatar = newMsg.find('#avatar')
      .attr('src', msgAuthor.imageUrl)
      .attr('alt',msgAuthor.firstName + ' ' + msgAuthor.lastName);
      
      newMsg.find('.msgbody').html(msgBody);
      if (msgReason)
         newMsg.find('.supp_data').text(msgPool + " " + msgDateStr  + " " +  msgReason );
      else {
      	 newMsg.find('.supp_data').text(msgPool + " " + msgDateStr  + " via "  +   msgSource);
      }
      var id = cometMsg.id; 

      var resendButton = newMsg.find('.resend');    
      
      if (cometResent) {
        resendButton.css("display", "none");
      } else {
        resendButton
            .attr('id', 'resend_' + id)     
            .attr('href', "javascript:resendFunction(" + id + ");")       
      }

      var tempStr = strip(msgBody).replaceAll ("'", "ZZZ$%$");
      
      var myReplyMsg = tempStr.replaceAll ("ZZZ$%$", "\\'");   
      
          
      newMsg.find('.reply').attr('href',
        "javascript:setReplyTo(" + id + ", '"+ myReplyMsg + "'," + msgPoolId + ", '" + msgAuthor.nickname + "')");
      var conversation = newMsg.find('.conversation');
      if (msgConversation != 0) {
        conversation.attr('href', 
          '/conversation/' + msgConversation);
      } else {
        conversation.css("display", "none");
      }

      // Insert the updated copy of the message into the page
      newMsg.prependTo(msgInsertPt).show();
      jQuery('#msgsep').clone().show();
    }
  }
}