const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const graphql = require('graphql')
const joinMonster = require('join-monster')

let app = express()

const { Client } = require('pg')
const client = new Client({
  host: "194.163.34.217",
  user: "training_admin",
  password: "training_admin2022",
  database: "training",
  port: 5490
})

client.connect()

const Player = new graphql.GraphQLObjectType({
  name: 'Player',
  extensions: {
    joinMonster: {
      sqlTable: "players",
      uniqueKey: "id_players",
    }
  },
  fields: () => ({
    id_players: { type: graphql.GraphQLInt },
    name_player: { type: graphql.GraphQLString },
    team: {
      type: new graphql.GraphQLList(Team),
      extensions: {
        joinMonster: {
          sqlJoin: (playerTable, teamTable, args) => `${playerTable}.id_team = ${teamTable}.id_team`
        }
      }

    }

  })
});

var Team = new graphql.GraphQLObjectType({
  name: 'Team',
  extensions: {
    joinMonster: {
      sqlTable: "teams",
      uniqueKey: "id_team"
    }
  },
  fields: () => ({
    id_team: { type: graphql.GraphQLInt },
    name_team: { type: graphql.GraphQLString },
    // players: {
    //   type: graphql.GraphQLList(Player),
    //   sqlJoin: (teamTable, playerTable, args) => `${teamTable}.id_team = ${playerTable}.id_team`
    // }
  })
})

const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hello: {
      type: graphql.GraphQLString,
      resolve: () => "Hello world!"
    },
    players: {
      type: new graphql.GraphQLList(Player),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          console.log(sql, 'ini selq')
          return client.query(sql)
        })
      }
    },
    player: {
      type: Player,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (playerTable, args, context) => `${playerTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    teams: {
      type: new graphql.GraphQLList(Team),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    team: {
      type: Team,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (teamTable, args, context) => `${teamTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
  })
})

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
});
app.use('/api', graphqlHTTP({
  schema: schema,
  graphiql: true
}));
app.listen(4000)