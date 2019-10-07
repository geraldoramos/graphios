// tslint:disable:no-expression-statement
import test from 'ava';
import { graphios } from './graphios';

test('graphios', async t => {

const getData = await graphios({
    query: `{Media(type:ANIME){
      season
    }}`,
    url: 'https://graphql.anilist.co',
  })
  t.is(getData.status, 200)
})
