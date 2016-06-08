const debounce = require('./utils').debounce;

/*istanbul ignore next*/
function Sticky (el, opts) {
	this.el = el;
	this.opts = opts;
}

/*istanbul ignore next*/
Sticky.prototype.stick = function () {
	this.el.style.position = 'fixed';
	this.el.style.top = '0px';
	this.sibling.style.marginTop = this.el.offsetHeight + 'px';
};
/*istanbul ignore next*/
Sticky.prototype.unstick = function () {

	this.el.style.position = 'absolute';
	this.el.style.top = this.stickyUntilPoint + 'px';
	this.sibling.style.marginTop = this.el.offsetHeight + 'px';
};
/*istanbul ignore next*/
Sticky.prototype.reset = function () {

	this.el.style.position = 'static';
	this.sibling.style.marginTop = '0px';
};
/*istanbul ignore next*/
Sticky.prototype.onScroll = function () {
	if(this.stickyUntilPoint > window.pageYOffset) {
		requestAnimationFrame(this.stick.bind(this));
	} else {
		requestAnimationFrame(this.unstick.bind(this));
	}
};
/*istanbul ignore next*/
Sticky.prototype.onResize = function () {
	if(this.onScrollListener && this.el.offsetHeight < 10) {
		this.unbindScroll();
	} else if (!this.onScrollListener && this.el.offsetHeight >= 10) {
		this.bindScroll();
	}
	this.stickyUntilPoint = (this.opts.stickUntil.offsetTop + this.opts.stickUntil.offsetHeight - this.el.offsetHeight);

};
/*istanbul ignore next*/
Sticky.prototype.bindScroll = function () {
	this.onScrollListener = debounce(this.onScroll).bind(this);
	window.addEventListener('scroll', this.onScrollListener);
};
/*istanbul ignore next*/
Sticky.prototype.unbindScroll = function () {
	window.removeEventListener('scroll', this.onScrollListener);
	this.onScrollListener = null;
	this.reset();
};
/*istanbul ignore next*/
Sticky.prototype.init = function () {

	if(!this.el) {
		return;
	};

	this.sibling = this.el.nextElementSibling;
	this.stickyUntilPoint = (this.opts.stickUntil.offsetTop + this.opts.stickUntil.offsetHeight - this.el.offsetHeight);
	this.el.style.zIndex = '23';

	window.addEventListener('resize', debounce(this.onResize).bind(this));

	this.bindScroll();

	if(window.pageYOffset > 0) {
		this.unstick();
	}
};


module.exports = Sticky;