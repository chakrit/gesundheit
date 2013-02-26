var nodes = require('../../lib/nodes')

var test = require('tap').test

test('Relation Node', function (t) {
  var n = nodes.toRelation('rel')
  t.equal(n.copy().value, 'rel', "copying it keeps the name")
  t.end()
})

test("Update Node", function (t) {
  var n = new nodes.Update({table: 't1'})
  t.equal(n.relation.ref(), 't1', "it has a relation with the right name")
  n = n.copy()
  t.equal(n.relation.ref(), 't1',
          "copying it keeps the original relation name")
  t.end()
})

test("Text Helper", function (t) {
  var n = nodes.text("x BETWEEN 1 AND 10")
  t.equal(n.constructor, nodes.TextNode, 'creates a TextNode without params')
  t.deepEqual(n.params(), [], "TextNode::params returns empty array")
  n = nodes.text("x BETWEEN $0 AND $1", [1, 10])
  t.equal(n.constructor, nodes.TextNode, 'creates a TextNode with params')
  t.deepEqual(n.params(), [1, 10],
              "TextNode::params returns correct parameters")
  var dialect = {
    render: function (p) {
      t.equal(p.constructor, nodes.Parameter,
              'creates Parameter nodes for bindVals')
      return '&'
    }
  }
  t.equal(n.render(dialect), 'x BETWEEN & AND &',
          'Placeholders are replaced using dialect')
  t.bindVals = []
  t.throws(n.render(dialect), 'exception thrown when parameters are missing')
  t.type(n.as, 'function', 'text nodes have an "as" method')
  t.type(n.eq, 'function', 'text nodes have an "eq" method') // ComparableMixin
  t.end()
})

test('exists/notExists helpers', function (t) {
  var select = require('../../').select
  t.equal(
    select('t1')
      .where(nodes.notExists(select('t1', ['id']).where({id: 3})))
      .render(),
    "SELECT * FROM t1 WHERE NOT EXISTS " +
    "(SELECT t1.id FROM t1 WHERE t1.id = $1)",
    "Can create NOT EXISTS conditions using subqueries"
  )

  t.equal(
    select('t1')
      .where(nodes.exists(select('t1', ['id']).where({id: 3})))
      .render(),
    "SELECT * FROM t1 WHERE EXISTS (SELECT t1.id FROM t1 WHERE t1.id = $1)",
    "Can create EXISTS conditions using subqueries"
  )
  t.end()
})
