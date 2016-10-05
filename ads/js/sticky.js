const debounce = require('./utils').debounce;
const stickyNavHeight = 74; // for use with Right Hand Rail

function Sticky(el, opts) {
	debugger;
  this.opts = opts || {};
  this.fixed = el;
  this.boundary = document.querySelector(this.opts.stickUntil);
  this.eventdbScrollEnd = this.debounce(this.scrollEnd.bind(this), 300);
  this.eventScrollStart = this.scrollStart.bind(this);
	this.sibling = opts.sibling ? document.querySelector(opts.sibling) : null;
	this.extraHeight = 0;
	this.cookieMessage = document.querySelector('.cookie-message');

  this.animationFrame;
  this.startScroll;
  this.boundaryTop;
  this.fixedHeight;
}


Sticky.prototype.debounce = function (cb, wait) {
	let timeout;
	return function () {
    clearTimeout(timeout);
		timeout = setTimeout(cb, wait);
	}
}

Sticky.prototype.startLoop = function () {
  this.animationFrame = window.requestAnimationFrame(() => {
    const atBoundary = (window.scrollY - this.startScroll + this.fixedHeight) >= this.boundaryTop;
    const isAbsolute = this.fixed.style.position === 'absolute';
		const extraAbsolute = ((window.scrollY - this.extraHeight) >= 0);

    if ((atBoundary && !isAbsolute)) {
      this.fixed.style.position = 'absolute';
      this.fixed.style.top = this.startScroll + this.boundaryTop - this.fixedHeight + 'px';
    }

    if (!atBoundary && isAbsolute && extraAbsolute) {
			if(extraAbsolute) {
	      this.fixed.style.position = 'fixed';
	      this.fixed.style.top = '0px';
				if (this.sibling) {
					this.sibling.style.marginTop = this.fixedHeight  + 'px';
				}
			}
    }

		if(!extraAbsolute && !isAbsolute) {
			this.reset();
		}

    this.startLoop();
  });
}

Sticky.prototype.reset = function () {
	this.fixed.style.position = 'absolute';
	this.fixed.style.top = this.extraHeight + 'px';
}

Sticky.prototype.endLoop = function () {
  window.cancelAnimationFrame(this.animationFrame);
}

Sticky.prototype.scrollStart = function () {
  window.removeEventListener('scroll', this.eventScrollStart);
  window.addEventListener('scroll', this.eventdbScrollEnd)

  // only do this work once
  this.fixedHeight = this.fixed.offsetHeight;
  this.startScroll = window.pageYOffset;
  this.boundaryTop = this.boundary.getBoundingClientRect().top;

	if (this.sibling && this.sibling.style.marginTop !== this.fixedHeight + 'px') {
		this.sibling.style.marginTop = this.fixedHeight + 'px';
	}

  this.startLoop();
}


Sticky.prototype.scrollEnd = function () {
  this.endLoop();
  window.removeEventListener('scroll', this.eventdbScrollEnd);
  window.addEventListener('scroll', this.eventScrollStart);
}



Sticky.prototype.init = function () {
	if(!this.fixed || window.pageYOffset > 0 || window.scrollY > 0) {
		return;
	};

  window.addEventListener('scroll', this.eventScrollStart);
	const fixedElementTopPosition = this.fixed.getBoundingClientRect().top;
  this.fixed.style.zIndex = '23';
  this.fixed.style.top = fixedElementTopPosition + 'px';

	if(fixedElementTopPosition > 0) {
		this.extraHeight = fixedElementTopPosition;
		this.fixed.style.position = 'absolute';
	} else {
		this.fixed.style.position = 'fixed';
	}

	if (this.sibling) {
		this.sibling.style.marginTop = this.fixed.offsetHeight + 'px';
	}

	const cookieCloseButton = document.querySelector('.o-cookie-message__close-btn');
	if(cookieCloseButton) {
		let cookieCloseEvent = cookieCloseButton.addEventListener('click', function(){
			this.extraHeight = 0;
			this.reset();
			cookieCloseButton.removeEventListener('click', cookieCloseEvent)
		}.bind(this));
	}
}

module.exports = Sticky;
