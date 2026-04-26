import Test from '../src/test.js'
import Role from '../src/role.js'

const t = new Test()

const hasTest = () => {
	let role = new Role({ crud: { index: true } })
	t.true(role.has('crud.index'))
	t.false(role.has('hoge.fuga'))
	t.false(role.has('crud.delete'))
	role.add('crud.delete')
	t.true(role.has('crud.delete'))
	role.remove('crud.delete')
	t.false(role.has('crud.delete'))
	role = new Role([
		'crud.@all',
		'crud.!upsert',	
	])
	t.true(role.has('crud.hoge'))
	t.false(role.has('crud.upsert'))
	t.false(role.has('hoge.fuga'))

	role = new Role([
		'user.edit.delete',	
	])
	t.true(role.has('user.edit'))
	t.true(role.has('user.edit.delete'))
	t.false(role.has('user.insert'))

	role.remove('user.edit')
	t.false(role.has('user.edit'))

	role = new Role([
		'user.@all',	
	])
	t.true(role.has('user.edit'))
	t.true(role.has('user.edit.delete'))
}
const addTest = () => {
	let role = new Role()
	role.add('user.@all')
	t.eq(role.conf, { user: { '@all': true } })
	role.add('user.index')
	t.eq(role.conf, { user: { index: true } })
	role.add('user.edit.upsert')
	t.eq(role.conf, { user: { index: true, edit: { upsert: true } } })
	role.add('user.edit.@all')
	t.eq(role.conf, { user: { index: true, edit: { '@all': true } } })
	role.remove('user.index')
	t.eq(role.conf, { user: { edit: { '@all': true } } })
	role.remove('user.edit')
	t.eq(role.conf, {})

	role = new Role()
	role.add('user.edit.upsert')
	t.eq(role.conf, { user: { edit: { upsert: true } } })
	role.add('user.edit.@all')
	t.eq(role.conf, { user: { edit: { '@all': true } } })

	role.add('user.edit.~delete')
	t.true(role.has('user.edit.upsert'))

	t.false(role.has('user.edit.delete'))
	t.eq(role.conf, { user: { edit: { '@all': true, '~delete': true } } })

	role.add('user.edit.upsert')
	role.remove('user.edit.upsert')
	role.remove('user.edit.~delete')

	t.false(role.has('user.edit'))

	role.add('hoge')
	t.true(role.has('hoge'))
	t.true(role.has('hoge,bar'))
	t.false(role.has('foo,bar'))
}

// hasTest()
addTest()
