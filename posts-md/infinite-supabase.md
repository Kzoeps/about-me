I've been furiously working on zimchu.com. A rental listing site for apartments in Thimphu. I ended up using supabase for it and also used react-query for all of the fetch stuff.

The biggest assumption I'm making for this project is that people want a more organized and easily searchable data for house listings. So a filter feature is a must have for the mvp. 

I wanted an infinite scroll for the rental listing page. `react-query` already has hooks and examples for infinite pagination so that made the initial setup relatively easy. The confusing portion was trying to combine the filter form with the infinite pagination.

## Infinite Pagination Setup

This is the infinite pagination query from the react-query-docs.

```js
const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery('projects',async ({pageParam}) => fetchProjects(pageParam), {
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })
```

Most of it was copy pasta except configuring the `nextPageParam` and `hasNextPage` with supabase. The docs, quite rightfully, show it for actual BE APIs.

The `getNextPageParam` decides both `pageParam` and `hasNextPage` variables. If you return undefined in `getNextPageParam` it sets `hasNextPage` to false. If you return anything other than undefined it gets passed to your fetch function as pageParam.

My supabase query at this point looked something like this

```js
const fetchRentals = async () => {
    supabase.from('listings').select()
}
```

I needed to change supabase query to implement pagination using pageParam and it looked something like this 
```js
const fetchRentals = async (pageParam: number) => {
    const PAGE_SIZE = 5
    const from = pageParam * PAGE_SIZE
    const to = (pageParam + 1) * PAGE_SIZE - 1
    return supabase.from('listings').select().sort({ascending: false}).from(from, to)
}
```

Okay great! At this point I had set up pagination for supabase and it was quite smooth sailing. Then I moved on to implementing `getNextPageParam` function so that it would automatically load more listings once the user is at the end of the page 

The code looked something like this. This was also quite straightforward other than the part where I had to figure out I needed to return undefined if theres no more data. That just took time reading the docs though.

```js
const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery('projects',async ({pageParam = 0}) => fetchProjects(pageParam), {
    // lastPage is the result of the last fetch call
    getNextPageParam: (lastPage, pages) => {
      // 5 because i set the pagination result limit to 5, if less than 5 i know theres no more data
        if (lastPage.length < 5) {
            return undefined
        }
        // otherwise i return this, which is the pageParam
        return pages.length + 1
    },
  })
```
*initally `pageParam` will be undefined so you have to set it to zero for the initial query*

## Filter and Infinite Pagination

Great! I implemented basic infinite query listing with supabase and react-query but now I had the tricky part of setting it up with the filters. I wanted to make sure that everytime I set a filter, the pageParam reset to zero and the supabase call was executed with the filters otherwise this would be useless.

For the filter I had a form which had the fields `minRent`, `maxRent`, `size`,`location`.

The key to implementing this was with how QueryKeys worked(pun intended). QueryKeys get converted to arrays and in the above case `projects` string in `useInfiniteQuery` gets converted to `['projects']`. And you can also add other things to the array. Say any params we use can be added to this: `['projects', anyParamHere]` and this is passed on to the function we have in useInfiniteQuery. 

The form is build using react-hook-form.

```js
const init = {minRent: '' , maxRent: '', size: '', location: ''}
const {getValues} = useForm({defaultValues: init})
const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery('projects',async ({pageParam = 0}) => fetchProjects(pageParam), {
    getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < 5) {
            return undefined
        }
        return pages.length + 1
    },
  })
```

I wanted to set up the queryKeys such that it also took the form and everytime the form changed I wanted the infinite query to run.

So I set it up like this:
```js
const init = {minRent: '' , maxRent: '', size: '', location: ''}
const {getValues} = useForm({defaultValues: init})
const [form, setForm] = useState(getValues())
const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(['projects',form],async ({pageParam = 0}) => fetchProjects(pageParam, form), {
    getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < 5) {
            return undefined
        }
        return pages.length + 1
    },
  })
```

And updated the supabase fetch call to use the form to build up the query instead of executing it at once
```js
const fetchRentals = async (pageParam: number, { minRent, maxRent, size, location}) => {
    const PAGE_SIZE = 5
    const from = pageParam * PAGE_SIZE
    const to = (pageParam + 1) * PAGE_SIZE - 1
    let query = supabase.from('listings').select().sort({ascending: false}).from(from, to)
    query = query.gte('rent', !minRent ? 0 : minRent )
    query = query.lte('rent', !maxRent ? 100000 : maxRent ) 
    if (size) {
        query = query.eq('size', size)
    }
    if (location) {
        query = query.eq('location', location)
    }
    return query
}
```

While writing the blog I wanted to check if it could work using a ref instead of a state value since I dont use it for rendering purposes and it seems to work. Updated code:
```js
const init = {minRent: '' , maxRent: '', size: '', location: ''}
const {getValues} = useForm({defaultValues: init})
const form = useRef(form)
const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(['projects',form.current],async ({pageParam = 0}) => fetchProjects(pageParam, form.current), {
    getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < 5) {
            return undefined
        }
        return pages.length + 1
    },
  })
```

I have it set up such that when the user hits the apply button i set the form vals to be whatever the user entered.