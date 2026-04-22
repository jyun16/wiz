import { expandRange } from '../src/index.js'
import { isPublicHoliday, isHoliday, getCalendarDays } from '../src/calendar.js'
import Test from '../src/test.js'

const t = new Test()
t.true(isPublicHoliday('2026-05-03'))
t.true(isHoliday('2026-05-02'))
t.false(isPublicHoliday('2026-05-02'))
t.false(isPublicHoliday('2026-05-07'))
t.eq([
	[0,0,29], [0,1,30], [0,2,31],
	[1,3,1],
	[1,4,2],
	[1,5,3],
	[1,6,4],
	[1,0,5],
	[1,1,6],
	[1,2,7],
	[1,3,8],
	[1,4,9],
	[1,5,10],
	[1,6,11],
	[1,0,12],
	[1,1,13],
	[1,2,14],
	[1,3,15],
	[1,4,16],
	[1,5,17],
	[1,6,18],
	[1,0,19],
	[1,1,20],
	[1,2,21],
	[1,3,22],
	[1,4,23],
	[1,5,24],
	[1,6,25],
	[1,0,26],
	[1,1,27],
	[1,2,28],
	[1,7,29],
	[1,4,30],
	[0,5,1], [0,6,2], [0,7,3], [0,7,4], [0,7,5], [0,7,6], [0,4,7], [0,5,8], [0,6,9]
], getCalendarDays(2026, 4))
