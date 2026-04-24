import util from 'util'
import { isEmpty, isArray, array2map, deepClone, sprintf } from '../src/index.js'
import { d } from '../src/debug.js'
import Test from '../src/test.js'
import Validator from '../src/validator.js'

const t = new Test()
const v = new Validator()
v.v.required('req', '')
v.call('equal', 'eq1', 'a', 'b')
v.v.equal('eq2', 'a', 'b', 'custom error message') // validaation の引数オーバーした分はエラーメッセージになる
v.v.min('min', 'hoge', 4) 
v.v.max('max', 'hoge', 2)
const p = { text: 'HOGE', password: 'x' }
v.appendExtraError('unique', 'uniq')
t.true(v.hasError())
t.eq(v.error, {
	req: '必ず入力してください',
	eq1: '値が一致しません',
	eq2: 'custom error message',
	max: '2 文字以内で入力してください',
	uniq: '既に存在します',
})
v.reset()
v.customMessage('required', '空ですが？')
v.v.required('custom_msg', '')
t.eq(v.error, {
	custom_msg: '空ですが？'
})
v.reset()
v.custom('custom_checker', (v1, v2) => {
	return v1 == v2
}, 'カスタムチェックのエラー')
v.v.custom_checker('custom_checker', 'xxx', 'yyy')
t.eq(v.error, {
	custom_checker: 'カスタムチェックのエラー'
})
v.customMessage('extra.unique', 'かぶった！')
t.eq(v.message.extra.unique, 'かぶった！')

const FORM = {
	text: {
		type: 'text',
		validation: [
			'required',
		],
	},
	password: {
		type: 'password',
		validation: [
			'required',
			[ 'min', 4 ],
		],
	},
	password_confirm: {
		type: 'password',
		validation: [
			[ 'equal', 'password' ],
		],
	},
}

v.reset()

v.checkForm(FORM, {
	text: 'TEXT',
	password: 'AIUEO',
})
t.eq({
	password_confirm: '値が一致しません'
}, v.error)
