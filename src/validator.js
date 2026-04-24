import { isEmpty, isArray, array2obj, deepClone, setObjVal, sprintf } from './index.js'
import validation from './validation.js'

class Self {
	constructor(lang='ja') {
		this.lang = lang
		this.errors = {}
		this.hasError = _ => !isEmpty(this.errors)
		this.message = deepClone(Self.base_message[this.lang])
		this.reset = _ => this.errors = {}
		this.appendError = (method, errMsg) => {
			this.errors[method] = errMsg
		}
		this.appendExtraError = (method, name) => {
			this.appendError(name, this.message.extra[method])
		}
		this.init()
	}
	init() {
		this.v = {}
		for (const method in validation) {
			this.v[method] = (...a) => {
				this.call(method, ...a)
			}
		}
	}
	call(method, ...a) {
		const name = a.shift()
		if (!validation[method](...a)) {
			const len = validation[method].length
			let msg = (len < a.length) ? a[a.length - 1] : this.message[method]
			a.shift()
			msg = sprintf(msg, ...a)
			this.errors[name] = msg
		}
	}
	customMessage(method, msg) {
		if (method.includes('.')) {
			setObjVal(this.message, method, msg)
		}
		else {
			this.message[method] = msg
		}
	}
	custom(method, func, msg) {
		this.message[method] = msg
		validation[method] = func
		this.v[method] = (...a) => {
			this.call(method, ...a)
		}
	}
	checkForm(FORM, p, target, dbValid) {
		this._check(FORM, p, target, dbValid)
	}
	async _check(FORM, p, target, dbValid) {
    let isSkip = false
    if (target) {
      if (isArray(target) && target.length > 0 && target[0].startsWith('!')) {
        isSkip = true
        target = target.map(t => t.replace(/^!/, ''))
      }
      target = isArray(target) ? array2obj(target) : { [target]: true }
    }
    for (const [ n, o ] of Object.entries(FORM)) {
      if (target) {
        if (!isSkip && !target[n]) continue
        if (isSkip && target[n]) continue
      }
      if (o.validation) {
        for (const va of o.validation) {
          if (this.errors[n]) break
          if (isArray(va)) {
            const vva = deepClone(va)
            const vn = vva.shift()
            if (vn == 'equal') vva[0] = p[vva[0]]
            this.v[vn](n, p[n], ...vva)
          }
          else {
            this.v[va](n, p[n])
          }
        }
      }
      if (dbValid && o.dbValidation && !this.errors[n]) {
        for (const va of o.dbValidation) {
          if (this.errors[n]) break
          if (isArray(va)) {
            const vva = deepClone(va)
            const vn = vva.shift()
            await dbValid(n, vn, vva)
          }
          else {
            await dbValid(n, va, [])
          }
        }
      }
    }
  }
}
Self.base_message = {
	ja: {
		required: '必ず入力してください',
		requiredChoice: '必ず選択してください',
		equal: '値が一致しません',
		compare: '範囲内で正しく入力してください',
		integer: '数値で入力してください',
		number: '数値で入力してください',
		min: '最低 %s 文字入力してください',
		max: '%s 文字以内で入力してください',
		email: '正しいメールアドレスを入力してください',
		zipcode: '正しい郵便番号を入力してください',
		phone: '正しい電話番号を入力してください',
		zenkaku: '全角文字で入力してください',
		hiragana: 'ひらがなで入力してください',
		katakana: '全角カタカナで入力してください',
		hanKatakana: '半角カタカナで入力してください',
		alphanum: '半角英数字で入力してください',
		alphabet: '半角英字で入力してください',
		creditcard: '正しいクレジットカード番号を入力してください',
		url: '正しい URL を入力してください',
		httpUrl: '正しい URL を入力してください',
		password: 'パスワードには大小英字と数字と記号を必ず含んでください',
		datetime: '正しい日時を入力してください',
		date: '正しい日付を入力してください',
		time: '正しい時刻を入力してください',
		hourmin: '正しい時刻を入力してください',
		extra: {
			unique: '既に存在します',
		},
	},
}

export default Self
