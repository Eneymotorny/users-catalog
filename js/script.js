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
						&& $dropBtns.has(e.target).length === 0
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
			this.btn.addClass('btn-active')
		} else {
			this.dropMenu.slideUp(150);
			setTimeout(function () {
				_this.dropMenu.removeAttr('style');
				_this.btn.removeClass('btn-active')
			}, 200);
			this.active = false;
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

	function Form(formSelector, bindCatalog) {
		this.form = $(formSelector);
		this.inputs = this.getInputs();
		this.values = {};
		var _this = this;
		this.submit = $(formSelector).find('[type="submit"]')
			.on('click', function (e) {
			e.preventDefault();
			if ( _this.validateAll() ){
				bindCatalog.createUser(_this.getValues())
			}
		});
	}
	Form.prototype.getInputs = function (inp) {
		var $inps = this.form.find('input:not([type="submit"])')
			.attr('required', 'required');
		$inps.parent().addClass('inp-default');
		$inps.filter('[type="password"]').attr('minlength', 4).attr('maxlength', 20);

		var _this = this;
		$inps.blur(function () {
			_this.validate( $(this) )
		});

		return $inps
	};
	Form.prototype.validate = function (inp) {
		inp = $(inp);
		var inpType = (inp.attr('type') === 'text')? inp.attr('name'): inp.attr('type');

		var pattern;
		switch (inpType) {
			case 'name': pattern = /^[а-я-ёaїієґ`a-z]+$/i; break;
			case 'login': pattern = /^[a-z][a-z0-9-_]{1,20}$/; break;
			case 'email': pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; break;
			default: break;
			case 'password': pattern = /^[^\s]{4,20}$/; break;
		}
		var result = false;

		if (inp.val().trim() === '') {
			inp.val( inp.val().trim() );
			inp.parent().removeClass().addClass('inp-warning inp-empty');
			setTimeout(function () {
				inp.parent().removeClass().addClass('inp-default');
			}, 4000)
		}
		else {
			if (inp.val().search(pattern) === 0){
				inp.parent().removeClass().addClass('inp-success');
				result = true
			} else {
				inp.parent().removeClass().addClass('inp-warning');
			}
		}
		return result
	};
	Form.prototype.validateAll = function () {
		var _this = this;
		this.inputs.each(function (indx, elem) {
			var $elem = $(elem);
			if ( _this.validate(elem) ) {
				_this.values[ $elem.attr('name') ] = $elem.val();
			} else {
				delete _this.values[ $elem.attr('name') ];
			}
		});
		return ( Object.keys(this.values).length === this.inputs.length )
	};
	Form.prototype.getValues = function () {
		var _this = this;
		setTimeout(function () {
			_this.inputs.val('');
			_this.inputs.parent().removeClass().addClass('inp-default');
		}, 500);
		return this.values
	};

	function UserCatalog(tableSelector, newsSelector) {
		this.table = $(tableSelector);
		this.newsArea = $(newsSelector);
		this.users = [];
		this.news = [];
	}
	UserCatalog.prototype.createUser = function (objUser) {
		var current = this.users.push(objUser) - 1;
		this.addUser(this.users[current]);

		var date = new Date();
		this.news.push({
			date: date.getFullYear() + '.' + date.getMonth() + '.' + date.getDate(),
			time: date.getHours() + ':' + date.getMinutes() + ':' +date.getSeconds(),
			text: 'Зарегистрирован пользователь <b>'+ objUser.name +'</b> под ником <b>'+ objUser.login +'</b>'
		});
		this.addArticle(this.news[current]);

	};
	UserCatalog.prototype.addUser = function (objUser) {
		var $lastTr = this.table.find('tr:nth-last-child(2)');
		$('<tr>').insertBefore($lastTr)
			.append('<td>'+ objUser.name +'</td>')
			.append('<td>'+ objUser.login +'</td>')
			.append('<td>'+ objUser.email +'</td>');
	};
	UserCatalog.prototype.addArticle = function (objArt) {
		$('<article>' +
				'<header>' +
					'<h3>System Info</h3>' +
					'<div class="metainf">' +
						'<b>&#9881; system </b><small>&#128197; '+ objArt.date +' </small><time>&#128337; '+ objArt.time +'</time>' +
					'</div>' +
				'</header>' +
				'<p>&#128712; '+ objArt.text +'</p>' +
			'</article>').appendTo(this.newsArea);
	};

	var nav = new NavBar('.nav');
	nav.elem.find('[type="submit"]').on('click', function (e) {
		e.preventDefault();
		nav.hideOtherDropMenus()
	});

	var catalog = new UserCatalog('#catalog table', '#news');
	var form = new Form('.tab-content form', catalog);

});
