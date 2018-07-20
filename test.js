import Promise from './Promise';

const p1 = new Promise((resolve, reject) => {
	console.log(0);
	resolve(5);
	console.log(1);
});
p1.then(d => {
	console.log(d);

	return new Promise(r => setTimeout(() => r('done1'), 2000));
})
	.then((d) => {
		console.log(d);
		return Promise.resolve('test');
	})
	.then(d => {
		console.log(d);

		return new Promise(r => setTimeout(() => r('done2'), 2000));
	})
	.then(console.log);
console.log(3)

//OUTPUT: 0 1 3 5 done1 test don2
