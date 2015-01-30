

function conjugateGradient(A, b, x0, N, maxitr, epsilon) {
	var x=numeric.clone(x0);			// 近似解
	var r=numeric.linspace(0, 0, N);	// 残差ベクトル
	var p=numeric.linspace(0, 0, N);	// 修正方向ベクトル
	var alpha=0;	// 修正係数
	var beta=0;	// 修正係数

	r=numeric.sub(b, numeric.dot(A, x));	// r0 = b - Ax
	p=numeric.clone(r);	// p0 = r0

	var count=0;
	var rbuf;
	var norm=numeric.dot(r, r);
	var normBuf;
	while(1) {
		y=numeric.dot(A, p);		// y = Ap
		alpha=norm/numeric.dot(p, y);	// alpha = (r dot r)/(p dot y) 
		x=numeric.add(x, numeric.mul(alpha, p));	// x = x + alpha p
		rbuf=numeric.clone(r);
		r=numeric.add(r, numeric.mul(-alpha, y));	// r = r - alpha y
		normBuf=norm;
		norm=numeric.dot(r,r);
		if(norm<epsilon*epsilon||count>=maxitr) {
			break;
		}
		beta=norm/normBuf;	// beta = (r dot r)/(rbuf dot rbuf)
		p=numeric.add(r, numeric.mul(beta, p));	// p = r + beta p
		++count;
	}
	//console.log("itr " + count + " maxitr " + maxitr);
	return x;
}



function conjugateGradientSparse(A, b, x0, N, maxitr, epsilon) {
	var x=numeric.clone(x0);			// 近似解
	var r=numeric.linspace(0, 0, N);	// 残差ベクトル
	var p=numeric.linspace(0, 0, N);	// 修正方向ベクトル
	var alpha=0;	// 修正係数
	var beta=0;	// 修正係数

	var result=makeSparse(A, N);
	var nnz=result.nonZeros;
	var values=result.valueArray;
	var rowOffset=result.rowOffsetArray;
	var colIdx=result.colIdxArray;

	r=numeric.sub(b, sparseAx(values, rowOffset, colIdx, x, N));	// r0 = b - Ax
	p=numeric.clone(r);	// p0 = r0

	var count=0;
	var rbuf;
	var norm=numeric.dot(r, r);
	var normBuf;
	while(1) {
		y=sparseAx(values, rowOffset, colIdx, p, N);	// y = Ap
		alpha=norm/numeric.dot(p, y);	// alpha = (r dot r)/(p dot y) 
		x=numeric.add(x, numeric.mul(alpha, p));	// x = x + alpha p
		rbuf=numeric.clone(r);
		r=numeric.add(r, numeric.mul(-alpha, y));	// r = r - alpha y
		normBuf=norm;
		norm=numeric.dot(r, r);
		if(norm<epsilon*epsilon||count>=maxitr) {
			break;
		}
		beta=norm/normBuf;	// beta = (r dot r)/(rbuf dot rbuf)
		p=numeric.add(r, numeric.mul(beta, p));	// p = r + beta p
		++count;
	}
	//console.log("itr " + count + " maxitr " + maxitr);
	return x;
}

function makeSparse(A, N) {
	var nnz=0;
	var rowIdx=[];
	var values=[];
	var colIdx=[];
	var rowOffset=[0];
	for(var i=0; i<N; ++i) {
		for(var j=0; j<N; ++j) {
			if(A[i][j]!=0) {
				values.push(A[i][j]);
				rowIdx.push(i);
				colIdx.push(j);
				++nnz;
			}
		}
	}
	for(var i=0; i<nnz-1; ++i) {
		if(rowIdx[i+1]!=rowIdx[i]) {
			rowOffset.push(i+1);
		}
	}
	rowOffset.push(nnz);
	return { nonZeros: nnz, valueArray: values, rowOffsetArray: rowOffset, colIdxArray: colIdx };
}

function sparseAx(values, rowOffset, colIdx, x, N) {
	var y=numeric.rep([N], 0);
	var n;
	var idx;
	for(var i=0; i<N; ++i) {
		n=rowOffset[i+1]-rowOffset[i];
		for(var j=0; j<n; ++j) {
			idx=rowOffset[i]+j;
			y[i]+=values[idx]*x[colIdx[idx]];
		}
	}
	return y;
}