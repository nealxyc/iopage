/**
 * 
 */
/**
 * @author nxiong
 * @requires window, jQuery, diff_match_patch, CodeMirror
 *
 * */
var global = global || window || this;
var $ = global.jQuery ;
var CodeMirror = global.CodeMirror ;
// Default settings
var dmp = new diff_match_patch();
var createDiff = function(win, doms){
	/* doms = {
			ta1: HTMLDOM.TEXTAREA,
			ta2: HTMLDOM.TEXTAREA,
			nextBtn: HTMLDOM.INPUT(button),
			prevBtn: HTMLDOM.INPUT(button),
			doDiffBtn: HTMLDOM.INPUT(button),
			doFormatBtn: HTMLDOM.INPUT(button)
		}
	*/
	if (! doms || !doms['ta1'] || !doms['ta2']){
		return ;
	}
	var $ = jQuery ;
	var cmOpt =  {
			mode: 'text/x-sql',
			indentWithTabs: true,
	        smartIndent: true,
	        lineNumbers: true,
	        matchBrackets : true,
	        autofocus: true,
			theme:'mssql',
			viewportMargin:Infinity,
			lineWrapping:true,
			showCursorWhenSelecting:true,
			fixedGutter: false,
			readOnly:true
//			readOnly:false
		};
	var autoDiff = false;
	var combinedScroll = true ;
	var markArray = [] ;
	var markIndex = 0;
	var cm, cm2, diffAt={value:0}, diffTotal={value:0}, prevBtn, nextBtn;
	var ZERO = {line: 0, ch: 0};
	var init = function(){
		cm = CodeMirror.fromTextArea(doms['ta1'], cmOpt);
		cm2 = CodeMirror.fromTextArea(doms['ta2'], cmOpt);
		
		//this.editor = cm ;
		//this.editor2 = cm2 ;
		
		if(doms['doDiffBtn'])
			$(doms['doDiffBtn']).on('click',function(event){
				doDiff(cm, cm2);
			});
		if (autoDiff){
			cm.on('change', function(event){
				doDiff(cm, cm2);
			});
			cm2.on('change', function(event){
				doDiff(cm, cm2);
			});
		}
		
		if(doms['diffAt'] && doms['diffTotal']){
			diffAt = doms['diffAt'];
			diffTotal = doms['diffTotal'];
		}
		
		if(combinedScroll){
			cm.on('scroll', function(event){
				var pos = cm.getScrollInfo();
				var pos2 = cm2.getScrollInfo();
				cm2.scrollTo(null, pos.top);
			});
			
			cm2.on('scroll', function(event){
				var pos = cm.getScrollInfo();
				var pos2 = cm2.getScrollInfo();
				cm.scrollTo(null, pos2.top);
			});
		}
		if(doms['doFormatBtn'])
			$(doms['doFormatBtn']).on('click',doFormat);
		doFormat();
		doDiff(cm, cm2);
		if(doms['nextBtn']) {
			nextBtn = doms['nextBtn'];
			$(doms['nextBtn']).on('click',{incre: 1},nextMark);
		}
		if(doms['prevBtn']){
			prevBtn = doms['prevBtn'];
			$(doms['prevBtn']).on('click', {incre: -1}, nextMark);
		}
		$(prevBtn).click();
		$(nextBtn).click();
		//focusOnMark(0);
	};
	
	var doDiff = function(cm, cm2){
		var marks = cm.doc.getAllMarks();
		for (var i in marks) marks[i].clear();
		marks = cm2.doc.getAllMarks();
		for (var i in marks) marks[i].clear();
		markArray = makeMarks(cm, cm2);
		markIndex = 0 ;
	};
	
	var setValue = function(dom, v){
		if(dom){
			dom.value = v ;
			if(typeof dom.innerHTML !== "undefined"){
				dom.innerHTML = v ;
			}
			else if(typeof dom.innerText !== "undefined"){
				dom.innerText = v ;
			}
		}
	};
	
	var setDisabled = function(dom, disabled){
		if(dom){
			dom.disabled = disabled ? true: false;
		}
	}
	

	var doFormat = function(){
		var formatter = new SQLFormatter();
		var opt = {
				newLineOnComma: true,
				smartIndent: true
				};
		cm.setValue(formatter.formatsql(cm.getValue(), opt));
		cm2.setValue(formatter.formatsql(cm2.getValue(), opt));
	};
	
	var countChar = function(str, ch){
		return str.split(ch).length - 1;
	};
	
	var getToLineCh = function(fromLineCh, str){
		var arr = str.split('\n');
		var toLine = fromLineCh.line + arr.length - 1 ;
		var toCh = arr.length > 1? arr[arr.length - 1].length: fromLineCh.ch + arr[arr.length - 1].length ;
		return {line: toLine, ch: toCh} ;
	};
	var makeMarks = function(cm, cm2){
		var left = cm.doc.getValue();
		var right = cm2.doc.getValue();
		var diffs = dmp.diff_main(left, right);
		
		var leftMark = {
				line: 0,
				ch: 0
		}, rightMark = {
				line: 0,
				ch: 0
		} ;
		//var leftRow = 0, rightRow = 0 ;
		
		var i = -1 ;
		while(++i < diffs.length){
			var diff = diffs[i];
			switch (diff[0]){
				case win.DIFF_DELETE:
					toLineCh = getToLineCh(leftMark, diff[1]);
					cm.markText(leftMark, toLineCh, {
						className:'delete'
					});
					leftMark = toLineCh ;
					break ;
				case win.DIFF_INSERT:
					toLineCh = getToLineCh(rightMark, diff[1]);
					cm2.markText(rightMark, toLineCh, {
						className:'add'
					});
					rightMark = toLineCh ;
					break ;
				default:
					rightMark2 = getToLineCh(rightMark, diff[1]);
					cm.markText(rightMark, rightMark2, {
						className:'equal'
					});
					rightMark = rightMark2 ;
					leftMark2 = getToLineCh(leftMark, diff[1]);
					cm.markText(leftMark, leftMark2, {
						className:'equal'
					});
					leftMark = leftMark2 ;
			}
		}
		return sortMarks(filterMarks(cm.getAllMarks().concat(cm2.getAllMarks())));
	};
	
	var sortMarks = function(mArray){
		mArray.sort(compareMark);
		return mArray ;
	};
	
	var filterMarks = function(mArray){
		var arr = []
		for(var i in mArray){
			if(mArray[i].className && mArray[i].className != 'equal'){
				arr.push(mArray[i]);
			}
		}
		
		return arr ;
	};
	
	var compareMark = function(m1, m2){
		var from1 = m1.find().from;
		var from2 = m2.find().from;
		//if (from1.line == from2.line){
			//return from1.ch - from2.ch ;
		//}
		return from1.line - from2.line ;
	};
	
	var nextMark = function(event){
		var incre = event.data.incre ;
		incre = incre? incre:1 ;
		markIndex += incre ;
		markIndex = markIndex >= markArray.length ? markArray.length - 1: (markIndex < 0? 0:markIndex) ;
		//disable button according to markIndex
		if(markIndex == markArray.length - 1){
			setDisabled(nextBtn, true) ;
		}else{
			setDisabled(nextBtn, false);
		}
		
		if(markIndex <= 0){
			setDisabled(prevBtn, true) ;
		}else{
			setDisabled(prevBtn, false);
		}
		//set label values
		setValue(diffAt, markIndex + 1);
		setValue(diffTotal, markArray.length);
		//if(markIndex < 0) markIndex = markArray.length - 1;
		focusOnMark(markIndex);
	};
	
	var focusOnMark = function(index){
		if(markArray.length == 0){
			return ;
		}
		var m = markArray[index] ;
		var pos = m.find();
		switch(m.className){
			case 'delete':
				cm.doc.setSelection(pos.to, pos.from);
				cm2.setSelection(ZERO, ZERO);
				break ;
			case 'add':
				cm2.doc.setSelection(pos.to, pos.from);
				cm.setSelection(ZERO, ZERO);
				break ;
			default:
		}
	};
	
	$(function(){
		init();
	});
	
};
