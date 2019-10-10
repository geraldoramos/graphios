// tslint:disable:no-expression-statement
import test from 'ava';
import { graphios } from './graphios';

test('graphios', async t => {

const getData = await graphios({
    query: `{Media(type:ANIME){
      season
    }}`,
    timeout: 10000,
    headers: {test:'should be there', test2:'should not be there'},
    url: 'https://graphql.anilist.co',

  }, { headers:{test2:'should be there 2'}  })

  t.is(getData.status, 200)
  t.is(getData.config.timeout, 10000)
  t.is(getData.config.headers.test, 'should be there')
  t.is(getData.config.headers.test2, 'should be there 2')
})
