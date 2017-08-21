'use strict';

$(function () {

	function NavBar(selector) {
		this.elem = $(selector);
		this.dropMenus = this.getDropMenus();
		this.tabs = this.getTabs();
		this.activeTab = null;
	}
	NavBar.prototype.getDropMenus = function () {
		var dropMenus = [],
			$dropMenus = $('[data-btn] + *'),
			$dropBtns = $('[data-btn]'),
			_this = this;

		this.elem.find('[data-btn]').each(function(indx, elem) {
			dropMenus.push( new DropMenu(elem, $(elem).next()) );
			dropMenus[indx].btn.on('click', function(){
				_this.hideOtherDropMenus(indx);
				setTimeout(function () {
					_this.dropMenus[indx].toggle();
				},150);

				$(document).on('click.interim', function (e) {
					if ( !$dropBtns.is(e.target)
						&& !$dropMenus.is(e.target)
						&& $dropMenus.has(e.target).length === 0
						&& $dropMenus.has(e.target).length === 0) {
						_this.hideOtherDropMenus();
						$(document).off('.interim');
					}
				})
			})
		});
		return dropMenus
	};
	NavBar.prototype.getTabs = function () {
		var tabs = {},
			_this = this;

		this.elem.find("[href ^= '#']").each(function (indx, elem) {
			var currentTab = new Tab(elem);
			tabs[currentTab.name] = currentTab;
			if (indx) {
				currentTab.hide()
			} else {
				currentTab.show();
				setTimeout( function () { _this.activeTab = currentTab }, 10 );
			}
			currentTab.btnTab.parent().on('click', function () {
				if (_this.activeTab) _this.activeTab.hide();
				currentTab.show();
				_this.activeTab = currentTab;
			})
		});
		return tabs
	};
	NavBar.prototype.hideOtherDropMenus = function (indx) {
		var activeDropMenus = [];
		for (var i = 0; i < this.dropMenus.length; i++) {
			if (this.dropMenus[i].active && i !== indx) {
				activeDropMenus.push(this.dropMenus[i])
			}
		}
		for (i = 0; i < activeDropMenus.length; i++) {
			activeDropMenus[i].toggle();
		}
	};

	function DropMenu(selectorBtn, selectorDropMenu) {
		this.btn = $(selectorBtn);
		this.dropMenu = $(selectorDropMenu);
		this.active = false;
	}
	DropMenu.prototype.toggle = function () {
		var _this = this;
		if (!this.active) {
			this.dropMenu.slideDown(150);
			this.active = true;
		} else {
			this.dropMenu.slideUp(150);
			setTimeout(function () {
				_this.dropMenu.removeAttr('style');
			}, 200);
			this.active = false
		}
	};

	function Tab(selectorTab) {
		this.btnTab = $(selectorTab).on('click', function (e) {
			e.preventDefault()
		});
		this.content = $( this.btnTab.attr('href') );
		this.name = this.content.attr('id');
		this.active = false;
	}
	Tab.prototype.show = function () {
		this.content.show();
		this.btnTab.parent().addClass('tab-active');
		this.active = true
	};
	Tab.prototype.hide = function () {
		this.content.hide();
		this.btnTab.parent().removeClass('tab-active');
		this.active = false
	};

	var nav = new NavBar('.nav');
	nav.elem.find('[type="submit"]').on('click', function (e) {
		e.preventDefault();
		nav.hideOtherDropMenus()
	});

});
