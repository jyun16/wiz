import { d } from '../src/index.js'
import ISA from '../src/isa.js'

class Hoge {
	constructor(id=0, aHoge='') {
		this.id = id
		this.name = `HOGE`
		this.aHoge = aHoge
	}
	say() { d(`[Hoge ${this.id} ${this.aHoge}] ${this.name}`) }
}
class Fuga {
	constructor(id=0, aFuga='') {
		this.id = id
		this.name = `FUGA`
		this.aFuga = aFuga
	}
	say() { d(`[Fuga ${this.id} ${this.aFuga}] ${this.name}`) }
}
class HogeFuga extends ISA(Hoge, Fuga) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'HogeFuga'
	}
	say() { d(`[HogeFuga ${this.id}] ${this.name}`) }
}

class Foo {
	constructor(id=0, aFoo='') {
		this.id = id
		this.name = `Foo`
		this.aFoo = aFoo
	}
	say() { d(`[Foo ${this.id} ${this.aFoo}] ${this.name}`) }
}
class Bar {
	constructor(id=0, aBar='') {
		this.id = id
		this.name = `Bar`
		this.aBar = aBar
	}
	say() { d(`[Bar ${this.id} ${this.aBar}] ${this.name}`) }
}
class FooBar extends ISA(Foo, Bar) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'FooBar'
	}
	say() { d(`[FooBar ${this.id}] ${this.name}`) }
}
class HogeFugaFooBar extends ISA(HogeFuga, FooBar) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'HogeFugaFooBar'
	}
	say() { d(`[HogeFugaFooBar ${this.id}] ${this.name}`) }
}

const hffb = new HogeFugaFooBar({ id: 99, aHoge: 'A-HOGE', aFuga: 'A-FUGA', aFoo: 'A-FOO', aBar: 'A-BAR' })
hffb.say()
hffb.as(FooBar, 'say')
hffb.as(Foo, 'say')
hffb.as(Bar, 'say')
hffb.as(HogeFuga, 'say')
hffb.as(Fuga, 'say')
hffb.as(Hoge, 'say')
d('HogeFugaFooBar', hffb.instanceof(HogeFugaFooBar))
d('FooBar', hffb.instanceof(FooBar))
d('Bar', hffb.instanceof(Bar))
d('Foo', hffb.instanceof(Foo))
d('HogeFuga', hffb.instanceof(HogeFuga))
d('Fuga', hffb.instanceof(Fuga))
d('Hoge',hffb.instanceof(Hoge))
d('Array', hffb.instanceof(Array))

d(HogeFugaFooBar.__isa_clss)
d(FooBar.__isa_clss)
d(HogeFuga.__isa_clss)
