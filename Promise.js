function isPromise(obj) {
	return (obj instanceof Promise) || obj.then;
}
function isDefined(obj) {
	return typeof obj !== 'undefined';
}
const PENDING = 0;
const RESOLVE = 1;
const REJECT = 2;

export default class Promise {
	static resolve(d) {
		return new Promise(r => r(d));
	}
	static reject(d) {
		return new Promise((r, r2) => r2(d));
	}
	_status = PENDING;
	_value = undefined;
	_cb = [];
	constructor(executor) {
		const resolve = (data) => {
			this._setState(RESOLVE, data);
		}
		const reject = (data) => {
			this._setState(REJECT, data);
		}

		executor(resolve, reject);
	}
	_wrapThenCb(onFulfilled, onRejected) {
		const getRet = () => {
			if (this._getState() === RESOLVE && onFulfilled) {
				return onFulfilled(this._value);
			} else if (this._getState() === REJECT && onRejected) {
				return onRejected(this._value);
			}
		};
		const normalize = (ret) => {
			if (!isDefined(ret) || !isPromise(ret)) {
				return Promise.resolve(ret);
			}

			return ret;
		}

		return normalize(getRet());
	}
	then(onFulfilled, onRejected) {
		let resolve, reject;
		const p = new Promise((r1, r2) => {
			resolve = r1;
			reject = r2;
		});

		this._addCb(() => {
			const ret = this._wrapThenCb(onFulfilled, onRejected);

			ret._addCb(() => {
				if (ret._getState() === RESOLVE) resolve(ret._value);
				if (ret._getState() === REJECT) reject(ret._value);
			});

		});

		return p;
	}
	_setState(state, result) {
		if (this._getState() === PENDING) {
			this._status = state;
			this._value = result;
			this._execCb();
		}
	}
	_getState() {
		return this._status;
	}
	_addCb(cb) {
		this._cb.push(cb);
		this._execCb();
	}
	_execCb() {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		if (this._getState() !== PENDING) {
			this._timer = setTimeout(this._callback.bind(this), 0);
		}
	}
	_callback() {
		const cbs = this._cb;

		this._cb = [];
		this._timer = null;

		cbs.forEach(cb => {
			cb();
		});
	}
}
