import { isEmpty, isArray, isObject, isString, split, getObjVal, setObjVal, hasObjKey, deleteObjVal } from './index.js'

/*

const role = new Role([ 'user.edit.@all', 'user.index' ])

const role = new Role({
	user: {
		index: true,
		edit: {
			'@all": true,
		}
	}
})

上の2つは結果的に同じ設定
この設定により

role.has('user.index')
role.has('user.edit.upsert')
role.has('user.edit.delete')

等が true を返す

@all はすべてを許可する意味(本来 $ にしたいが shell で展開されてしまうため @ にしている)

追加を行う場合は以下

role.add('group.edit.@all')

削除は以下

role.remove('group.edit.@all')

すべてを許可しつつ任意のアクションだけ拒否したい場合

role.add('user.edit.~delete')

のように「~」を接頭詞としてアクションを追加する(! にしたいがこれも shell で問題が起こる)

*/
const Self = class {
	constructor(conf = {}) {
		if (isObject(conf)) {
			this.conf = conf
		}
		else if (isArray(conf)) {
			this.conf = {}
			for (const key of conf) {
				setObjVal(this.conf, key, true)
			}
		}
		else if (isString(conf)) {
			this.conf = JSON.parse(conf)
		}
	}
	add(key) {
		const akey = split(key, '.')
		const leaf = akey.pop()
		if (leaf == '@all') {
			const map = getObjVal(this.conf, akey.join('.'))
			for (const k in map) { delete map[k] }
			if (!map) {
				setObjVal(this.conf, akey.join('.') + '.@all', true)
			}
			else {
				map['@all'] = true
			}
			return
		}
		else if (!/^\~/.test(leaf) && hasObjKey(this.conf, akey.join('.') + '.@all')) {
			deleteObjVal(this.conf, akey.join('.') + '.@all')
		}
		setObjVal(this.conf, key, true)
	}
	remove(key) {
		deleteObjVal(this.conf, key)
		const akey = split(key, '.')
		akey.pop()
		const pkey = akey.join('.')
		if (isEmpty(getObjVal(this.conf, pkey))) {
			deleteObjVal(this.conf, pkey)
		}
	}
	_has(key) {
		let ret = false
		key = split(key, '.')
		let pk = ''
		for (const k of key) {
			pk += k
			if (hasObjKey(this.conf, `${pk}.@all`)) {
				ret = true
				break
			}
			pk += '.'
		}
		const leaf = key.pop()
		const map = getObjVal(this.conf, key)
		if (map) {
			if (map[`\~${leaf}`]) { return false }
			else if (map[leaf]) { return true }
		}
		return ret
	}
	has(key) {
		for (const k of split(key)) {
			if (this._has(k)) {
				return true
			}
		}
		return false
	}
}

export default Self
