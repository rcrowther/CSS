// Can be used two ways. First is to put the function as written into
// the webpage. It must come after the menu. If you defer (must be an 
// external load), you can put in HEAD, and get parallel loading too,
// 
//   <script src="webbook-menu.js" defer></script>
//
// Or, given this may be the only JS on the page, strip the namespace
// then,
//    
//   window.onload = function(){...};
//
// I still see nothing wrong in that R.C.

(function(window, document, undefined) {

    // Originally this code stashed everything, as it should. However, 
    // DOM references are apparently not unique and usable in 
    // containers, not when I tired. So the code currently,
    // - seeks all menus on the page and closes them (not individual 
    // menus)
    // - Works on the fly
    // Be warned, there is plenty of JS/DOM freakery here, in the
    // container transformations etc. 
    // However, the code will seek ancestor menus and avoid closing 
    // them, allowing multilevel menus. R.C.
    // Also, I think menu shrinking on elsewhere click is assumed and 
    // shouldn't be. It's helpful on the web if menus open permanently.
    // Below are some start hints of code, if you ever wanted to enable 
    // that feature. From Pure CSS https://purecss.io/js/menus.js
    //var DISMISS_EVENT = (window.hasOwnProperty &&
                //window.hasOwnProperty('ontouchstart')) ?
                //'touchstart' : 'mousedown',

    //// Dismiss an open menu on outside event
    //document.addEventListener(DISMISS_EVENT, function (e) {
        //var target = e.target;
        //if (menuIsOpen) {
            //for (let sm of smList) {
                 //sm.style.display = "";
            //};
            //menuIsOpen = false;
        //};
    //});
        
    function SubMenuData(elem) {
        this.elem = elem;
        this.parentSubmenus = [];
        this.menu = null;
        this.subMenuShrinkList = [];
    }

    function hasClassName(elem, targetName) {
        var classNames = elem.className != undefined? elem.className.split(" ") : [];
        for (var j = 0, jl = classNames.length; j < jl; j++) {
            if (classNames[j] == targetName) {
                return true;
            }
        }
        return false;        
    }

    // Get the first menu above te given submenu, and higher submenus.
    // Faster to get parents than children
    function findSubMenuParentInfo(element) {
        const r = new SubMenuData(element);
        function recurse(elem) {
            var p = elem.parentNode;
            if (!p) {return};
            if(hasClassName(p, "toolbar-submenu")) {
                r.parentSubmenus.push(p);
            }
            if(hasClassName(p, "toolbar-menu")) {
                r.menu = p;
                return;
            }
            recurse(p);
        }
        recurse(element);
        return r;
    }



    // get all submenus
    const smList = document.getElementsByClassName("toolbar-submenu");

    // An ESC killer (I allow for that R.C.)
    document.addEventListener('keydown', function (e) {
        /* Esc */
        if (e.keyCode === 27) {
                    for(const smToShrink of smList) {
                        smToShrink.style.display = "";
                    };
        }
    });
    
    // Now, the onclicks
    for (let sm of smList) {
        // Switch off all menus (visible for non-ja)
        const openAnchor = sm.previousElementSibling;

        // Should have one of these. If not, don't bother
        if (openAnchor.className == "menu-anchor-open" || openAnchor.className == "submenu-anchor-open") {
            // 
            openAnchor.onclick = function() {
                // Don't try if it's expanded
                //? Empty string functions better than none
                // if not expanded..
                if (sm.style.display == "") {            
                    // Shrink everything bar the clicked 
                    // item and ascendants
                    const smData = findSubMenuParentInfo(sm);
                    
                    // Make into a Set for neater cross-checking
                    const smParents = new Set(smData.parentSubmenus);

                    // xxx.filter() won't work on an HTMLCollection, 
                    // only an array
                    const smArray = Array.from(smList);

                    // NB: filter makes a new array
                    const subMenuShrinkList = smArray.filter(function(x) { return !smParents.has(x); })
                    
                    for(const smToShrink of subMenuShrinkList) {
                        smToShrink.style.display = "";
                    };
                                        
                    // display the clicked item
                    sm.style.display = "block";
                };
            };
        };
    };

})(window, document)

