/* Blank Canvas Signatures for Gmail [http://blankcanvas.me/gmailsignatures/]
 * Copyright (c) 2009, 2010 Jerome Dane <http://blankcanvas.me/contact/>  
 * 
 * This file is part of the Blank Canvas Signatures for Gmail. Please see /readme.md for
 * more information, credits, and author requests. 
 * 
 * BC Gmail Signatures is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Method Documentation:
 * 
 * registerGmailHandler(callback:Function) - returns a GmailAPI instance to the callback function when available
 * 
 * $(str:String, root:HTMLObject) - returns a jQuery call made within the Gmail canvas 
 * 
 * getActiveElement() - returns a reference to the HTML element of the main view 
 * 
 * getGmilVersion() - returns the current version of Gmail being used
 * 
 * getMainElementWrapper() - returns the wrapper div for the main element
 * 
 * getPrimaryEmailAddress() - returns the primary gmail account's email address as a string
 * 
 * getSendButton() - returns a reference to the send button or false if it's not found
 * 
 * registerViewChangeCallback(callback:Function) - sets the function that will be called on view change
 * 
 */

if(!com) { var com = {} }
if(!com.BlankCanvas) { com.BlankCanvas = {} }

com.BlankCanvas.GmailAPI = {
	registerGmailHandler:function(callback) {
		try {
			function handlePageLoad(unsafeWin) {
				try {
					if (unsafeWin.document.location.toString().match(/mail\.google\.com/)) { // if in gmail
						com.BlankCanvas.jQuery.init(function(jq){
							try {
								// check for in gmail canvas (main) frame
								var body = unsafeWin.document.getElementsByTagName('body')[0];
								var canvas = jq("iframe#canvas_frame", body);
								if (canvas.size() == 1) {
									function listenForLoadComplete(){
										try {
											// check for standard gmail window
											if (typeof(canvas[0].contentDocument) != 'undefined' && jq('a[href*=/terms.html]', canvas[0].contentDocument).size() > 0) {
												//canvas = canvas[0].contentDocument;
												var gmailInstance = new com.BlankCanvas.GmailAPI.gmailInstance(unsafeWin, jq);
												gmailInstance.document = canvas[0].contentDocument;
												callback(gmailInstance);
											} else if(typeof(canvas[0].contentDocument) != 'undefined' && jq('#gb', canvas[0].contentDocument).size() == 0 && jq('iframe', canvas[0].contentDocument).size() == 1) {	
												// check for tear out
												var gmailInstance = new com.BlankCanvas.GmailAPI.gmailInstance(unsafeWin, jq, true);
												gmailInstance.document = canvas[0].contentDocument;
												callback(gmailInstance);
											}
											else 
												setTimeout(listenForLoadComplete, 300);
										} catch(e) { com.BlankCanvas.GmailSignatures.debug(e, 'com.BlankCanvas.GmailAPI.registerGmailHandler() > handlePageLoad() > listenForPageComplete()'); }
									}
									listenForLoadComplete();
								}
							} catch(e) { com.BlankCanvas.GmailSignatures.debug(e, 'com.BlankCanvas.GmailAPI.registerGmailHandler() > handlePageLoad() > com.BlankCanvas.jQuery.init(function() { ... }'); }
						});
					}
				} catch(e) { com.BlankCanvas.GmailSignatures.debug(e, 'com.BlankCanvas.GmailAPI.registerGmailHandler() > handlePageLoad()'); }
			}
			switch (com.BlankCanvas.BrowserDetect.browser) {
				case 'Firefox':
					com.BlankCanvas.FirefoxUnsafeWindow.registerPageLoadListener(handlePageLoad);
					break;
				default:
					handlePageLoad(window);
			}
		} catch(e) { com.BlankCanvas.GmailSignatures.debug(e, 'com.BlankCanvas.GmailAPI.registerGmailHandler()'); }
	},
	gmailInstance:function(unsafeWin, jq, isTearOut) {
		//alert('creating gmail inst');
		isTearOut = typeof(isTearOut) == 'undefined' ? false : isTearOut;
		this.isTearOut = isTearOut;
		this.unsafeWin = unsafeWin;
		var gmailInst = this;
		gmailInst.unsafeWin.addEventListener('unload', function() {
			gmailInst = null;
			delete gmailInst;
		}, true);
		
		//-------------------------- $ -----------------------------------------
		this.$ = function(str, obj) {
			obj = typeof(obj) != 'undefined' ? obj : gmailInst.document;
			return jq(str, obj);
		};
		//-------------------------- create element ------------------------------
		this.createElement = function(type) {
			return this.unsafeWin.document.createElement(type);
		} 
		//-------------------------- debug output -------------------------------
		this.debug = function(str) {
			function getFunctionName(fnct) {
				try {
					var str = fnct.toString().match(/function\s([^\(]+)\(/)[1];
				} catch(e) { var str = fnct.toString(); }
				if(fnct.caller)
					return str + "\n\n" + getFunctionName(fnct.caller);
				else return str;
			}
			var message = str + "\n\n" + getFunctionName(arguments.callee.caller);
			com.BlankCanvas.GmailSignatures.debug(message, 'com.BlankCanvas.GmailAPI');
		}
		//-------------------------- getSendButton ------------------------------
		this.getDiscardButton = function() {
			var buttonWrapper = isTearOut ?
				this.$('div[role=navigation] div:first', this.getActiveElement()) :
				this.$('div[role=navigation] div:first + div', this.getActiveElement());
			var numButtons = this.$('div', buttonWrapper).size(); 
			var button = this.$('div:eq(' + (numButtons - 1) + ')', buttonWrapper);
			return button.size() == 1 ? button[0] : false;
		}
		//-------------------------- getGmilVersion ----------------------------
		this.getGmailVersion = function() {
			return 'unknown';
			/*
			switch(com.BlankCanvas.BrowserDetect.browser) {
				case 'Firefox':
					// Attempts to load the Gmail version
					// latest known Gmail version: gmail_fe_642_p13
					if(typeof(this.gmailVersion) == 'undefined') {
						if(typeof(this.unsafeWin.GLOBALS) == 'undefined')
							this.debug("getGmailVersion()\n\nCan't find GLOBALS variable in Gmail");
						try {
							this.gmailVersion = this.unsafeWin.GLOBALS[3];
						} catch (e) {
							this.gmailVersion = 'unknown';
						}
					}
					break;
				case 'Chrome':
					return 'unknown';
					break;
			}
			return this.gmailVersion;
			*/
		}
		//-------------------------- getActiveElement ----------------------------
		this.getActiveElement = function() {
			try {	
				if (isTearOut) 
					return this.document;
				else {
					switch (this.getGmailVersion()) {
						case 'gmail_fe_642_p13':
						default:
							return this.$('div:visible', this.getMainElementWrapper())[0];
					}
				}
			} catch(e) {
				this.debug("getActiveElement()\n\n" + e);
			}
		}
		//-------------------------- getActiveViewType ----------------------------
		this.getActiveViewType = function() {
			try {	
				var activeElement = this.getActiveElement();
				switch (this.getGmailVersion()) {
					case 'gmail_fe_642_p13':
					default:
						if(this.$('div.G3', activeElement).size() > 0)
							return 'cv';	// conversation
						else if(this.$('textarea[name="to"]', activeElement).size() == 1)
							return 'co';	// compose
						else if(this.$('div:eq(3) + div + div + div + div span[email]', activeElement).size() > 0)
							return 'tl';	// inbox
						else
							return 'unknown';
				}
			} catch(e) { this.debug("getMainElement()\n\n" + e); }
		}
		//-------------------------- getFromAddress ---------------------------
		this.getFromAddress = function() {
			try {
				var fromSelector = this.getFromSelect();
				if (fromSelector) 
					return fromSelector.options[fromSelector.selectedIndex].value
				else {
					var fromInput = this.$('input[name="from"]');
					return fromInput.size() == 1 ? fromInput.attr('value') : this.getPrimaryEmailAddress();
				}
			} catch(e) { this.debug("getFromAddress()\n\n" + e); }
		}
		//-------------------------- getFromSelectlement ----------------------
		this.getFromSelect = function() {
			try {	
				var fromSelect = this.$('select[name=from]:eq(0)', this.getActiveElement());
				return fromSelect.size() == 1 ? fromSelect[0] : false;
			} catch(e) { this.debug("getFromSelect()\n\n" + e); }
		}
		//-------------------------- getMainElementWrapper ----------------------------
		this.getMainElementWrapper = function() {
			var gmailInstance = this;
			if(typeof(gmailInstance.numErrors) == 'undefined')
				gmailInstance.numErrors = 0;
			try {		
				if(gmailInstance.numErrors < 4 && (typeof(gmailInstance.mainElementWrapper) == 'undefined' || gmailInstance.mainElementWrapper.size() == 0)) {
					// The following is used during development to mark divs for easy debugging
					// it helps find an instance of a relatively uncommon class name to use
					// as a starting point for identifying the main element wrapper
					/*
					gmailInstance.$('div.diLZtc').each(function(i) {
						this.id = 'bcGmailWrapperParentTest' + i;
					});
					*/
					var subSelectStr =  ' div:first div:first + div.nH div:first';
					var index = gmailInstance.$('div.q0CeU div.diLZtc').size() - 1;
					
					gmailInstance.mainElementWrapper = gmailInstance.$('div.q0CeU div.diLZtc:eq(' + index + ')' + subSelectStr);
					// check for older versions of Gmail (depreciated)
					if (gmailInstance.mainElementWrapper.size() == 0)
						gmailInstance.mainElementWrapper = gmailInstance.$('div:first div:first + div div:first div:first + div div:eq(2) + div div:first div:eq(3) + div div:first');
					// check for chat on right labs feature (depreciated)
					if (gmailInstance.mainElementWrapper.size() == 0)
						gmailInstance.mainElementWrapper = gmailInstance.$('div:first div:first + table td:eq(0) + td div:first + div div:eq(2) + div div:first div:eq(3) + div div:first');
					// try for even older Gmail versions (depreciated)
					if (gmailInstance.mainElementWrapper.size() == 0)
						gmailInstance.mainElementWrapper = gmailInstance.$('div:first div:first + div div:first div:first + div + div div:eq(3) + div div:first div:eq(3) + div div:first');
					// check for chat on right labs feature in even older Gmail version (depreciated)
					if (gmailInstance.mainElementWrapper.size() == 0)
						gmailInstance.mainElementWrapper = gmailInstance.$('div:first div:first + table td:eq(0) + td + td div:first + div div:eq(3) + div div:first div:eq(3) + div div:first');
					gmailInstance.mainElementWrapper[0].id = 'bcGmailMainElementWrapper';
				}
				return gmailInstance.mainElementWrapper[0];				
			} catch(e) {
				gmailInstance.numErrors++;
				gmailInstance.debug("getMainElement()\n\n" + e);
			}
		}
		//----------------------- getMessageBoxText -----------------
		this.getMessageText = function() {
			var iframe = this.getMessageIframe();
			if(iframe) 
				return iframe.contentWindow.document.body.innerHTML
		}
		//-------------------------- getMessageBox ------------------------------
		this.getMessageBox = function() {
			var iframe = this.getMessageIframe();
			return iframe ? iframe : false;
		}
		//-------------------------- getMessageBoxIframe ------------------------
		this.getMessageIframe = function() {
			try {
				var iframes = this.$('form iframe', this.getActiveElement());
				return iframes.size() > 0 ? iframes.eq(iframes.size() - 1)[0] : false;	// return last iframe
			} catch(e) {
				this.debug("getMessageElement()\n\n" + e);
			}	
		}
		//-------------------------- getPrimaryEmailAddress ---------------------
		this.getPrimaryEmailAddress = function() {
			try {
				if(isTearOut) {
					return unsafeWin.document.title.toString().match(/([^\s]+)\s*$/)[1];
				} else
					return this.$('b', this.$('#guser')).eq(0).text();
			} catch(e) { this.debug("getPrimaryEmailAddress\n\n" + e); }
		}
		//-------------------------- getSendButton ------------------------------
		this.getSendButton = function() {
			try {
				var sendButton = this.$('div[role=navigation] div[role=button]:eq(0)', this.getActiveElement());
				return sendButton.size() == 1 ? sendButton[0] : false;
			} catch(e) { this.debug("getSendButton\n\n" + e); }
		}
		//-------------------------- registerFromSelectHandler ------------------
		this.registerFromSelectHandler = function(callback) {
			try {
				var gmailInstance = this;
				this.listeningForFromSelect = true;
				this.unsafeWin.addEventListener('unload', function() {	// listen for page unload and stop listening 
					gmailInstance.listeningForFromSelect = false;
				}, true);
				function checkForFromSelect() {
					try {
						if(gmailInstance.listeningForFromSelect) {
							var fromSelect = gmailInstance.getFromSelect(); 
							if(fromSelect)
								callback(fromSelect);
							else
								gmailInstance.unsafeWin.setTimeout(checkForFromSelect, 500);
						}
					} catch(e) { gmailInstance.debug("registerFromSelectHandler()\n\n" + e); }
				}
				checkForFromSelect();	
			} catch(e) { gmailInstance.debug("registerFromSelectHandler()\n\n" + e); }		
		}
		//-------------------------- registerMessageBoxHandler ------------------
		this.registerMessageBoxHandler = function(callback) {
			try {
				var gmailInstance = this;
				this.listeningForMessageBox = true;
				this.unsafeWin.addEventListener('unload', function() {	// listen for page unload and stop listening 
					gmailInstance.listeningForMessageBox = false;
				}, true);
				function checkForMessageBox() {
					try {
						if(gmailInstance.listeningForMessageBox) {
							if(gmailInstance.getMessageBox())
								callback();
							else
								gmailInstance.unsafeWin.setTimeout(checkForMessageBox, 500);
						}
					} catch(e) { gmailInstance.debug("registerMessageBoxHandler()\n\n" + e); }
				}
				checkForMessageBox();
			} catch(e) { gmailInstance.debug("registerMessageBoxHandler()\n\n" + e); }			
		}
		//-------------------------- registerMessageBoxGoneHandler ------------------
		this.registerMessageBoxGoneHandler = function(callback) {
			var gmailInstance = this;
			this.listeningForMessageBoxGone = true;
			this.unsafeWin.addEventListener('unload', function() {	// listen for page unload and stop listening 
				gmailInstance.listeningForMessageBoxGone = false;
			}, true);
			function checkForMessageBoxGone() {
				try {
					if(gmailInstance.listeningForMessageBoxGone) {
						if(!gmailInstance.getMessageBox())
							callback();
						else
							gmailInstance.unsafeWin.setTimeout(checkForMessageBoxGone, 500);
					}
				} catch(e) { gmailInstance.debug("registerMessageBoxGoneHandler()\n\n" + e); }
			}
			checkForMessageBoxGone();			
		}
		//-------------------------- registerViewChangeCallback -----------------
		this.registerViewChangeCallback = function(callback) {
			try {
				var gmailInstance = this;
				var oldActiveElement = null;
				this.listeningForViewChange = true;
				this.unsafeWin.addEventListener('unload', function() {	// listen for page unload and stop listening 
					gmailInstance.listeningForViewChange = false;
					gmailInstance.stopListeningForElements();
				}, true);				
				this.unsafeWin.setInterval(function() {
					try {
						if(gmailInstance.listeningForViewChange) {
							var newActiveElement = gmailInstance.getActiveElement();
							if (newActiveElement != oldActiveElement) {
								oldActiveElement = newActiveElement;
								gmailInstance.stopListeningForElements();
								callback();
							}
						}
					} catch(e) { gmailInstance.debug("registerViewChangeCallback()\n\n" + e); }
				}, 5000);
			} catch(e) {
				this.debug("registerViewChangeCallback()\n\n" + e);
			}
		}
		//-------------------------- setMessageBoxText -----------------
		this.setMessageText = function(str) {
			try {
				var iframe = this.getMessageIframe();
				if(iframe) 
					iframe.contentWindow.document.body.innerHTML = str;
			} catch(e) {
				this.debug("setMessageText()\n\n" + e);
			}	
		}
		//-------------------------- stopListeningForElements -----------------
		this.stopListeningForElements = function() {
			this.listeningForFromSelect = false;
			this.listeningForMessageBox = false;
			this.listeningForMessageBoxGone = false;
		}
	}
}