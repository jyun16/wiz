import { d } from '../src/index.js'
import Test from '../src/test.js'
import ISA from '../src/isa.js'

// smartInit は min すると使えないから注意
class Hoge {
	constructor(id=0, aHoge='') {
		this.id = id
		this.name = `HOGE`
		this.aHoge = aHoge
	}
	say() { return `[Hoge ${this.id} ${this.aHoge}] ${this.name}` }
	who() { return 'Hoge' }
}
class Fuga {
	constructor(id=0, aFuga='') {
		this.id = id
		this.name = `FUGA`
		this.aFuga = aFuga
	}
	say() { return `[Fuga ${this.id} ${this.aFuga}] ${this.name}` }
	who() { return 'Fuga' }
}
class HogeFuga extends ISA(Hoge, Fuga) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'HogeFuga'
	}
	say() { return `[HogeFuga ${this.id}] ${this.name}` }
}

class Foo {
	constructor(id=0, aFoo='') {
		this.id = id
		this.name = `Foo`
		this.aFoo = aFoo
	}
	say() { return `[Foo ${this.id} ${this.aFoo}] ${this.name}` }
}
class Bar {
	constructor(id=0, aBar='') {
		this.id = id
		this.name = `Bar`
		this.aBar = aBar
	}
	say() { return `[Bar ${this.id} ${this.aBar}] ${this.name}` }
}
class FooBar extends ISA(Foo, Bar) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'FooBar'
	}
	say() { return `[FooBar ${this.id}] ${this.name}` }
}
class HogeFugaFooBar extends ISA(HogeFuga, FooBar) {
	static smartInit = true
	constructor(a) {
		super(a)
		this.name = 'HogeFugaFooBar'
	}
	say() { return `[HogeFugaFooBar ${this.id}] ${this.name}` }
}

const t = new Test()

const hf = new HogeFuga({ id: 99, aHoge: 'A-HOGE', aFuga: 'A-FUGA' })
t.eq('[HogeFuga 99] HogeFuga', hf.say())
t.eq('[Fuga 99 A-FUGA] HogeFuga', hf.as(Fuga, 'say'))
t.eq('[Hoge 99 A-HOGE] HogeFuga', hf.as(Hoge, 'say'))
t.eq('Hoge', hf.who())

t.true(hf.instanceof(HogeFuga))
t.true(hf.instanceof(Fuga))
t.true(hf.instanceof(Hoge))
t.false(hf.instanceof(Array))

const hffb = new HogeFugaFooBar({ id: 99, aHoge: 'A-HOGE', aFuga: 'A-FUGA', aFoo: 'A-FOO', aBar: 'A-BAR' })
t.eq('[HogeFugaFooBar 99] HogeFugaFooBar', hffb.say())
t.eq('[FooBar 99] HogeFugaFooBar', hffb.as(FooBar, 'say'))
t.eq('[Foo 99 A-FOO] HogeFugaFooBar', hffb.as(Foo, 'say'))
t.eq('[Bar 99 A-BAR] HogeFugaFooBar', hffb.as(Bar, 'say'))
t.eq('[HogeFuga 99] HogeFugaFooBar', hffb.as(HogeFuga, 'say'))
t.eq('[Fuga 99 A-FUGA] HogeFugaFooBar', hffb.as(Fuga, 'say'))
t.eq('[Hoge 99 A-HOGE] HogeFugaFooBar', hffb.as(Hoge, 'say'))
t.true(hffb.instanceof(HogeFugaFooBar))
t.true(hffb.instanceof(FooBar))
t.true(hffb.instanceof(Bar))
t.true(hffb.instanceof(Foo))
t.true(hffb.instanceof(HogeFuga))
t.true(hffb.instanceof(Fuga))
t.true(hffb.instanceof(Hoge))
t.false(hffb.instanceof(Array))

// d(HogeFugaFooBar.__isa_clss)
// d(FooBar.__isa_clss)
// d(HogeFuga.__isa_clss)
