I've been furiously working on zimchu.com. A rental listing site for apartments in Thimphu. I ended up using supabase for it and also used react-query for all of the fetch stuff.

One of the features I want to build for this platform is a filter feature. Because the current listings on facebook aren't the best for filtering data. I wanted to create a more organized way of doing this.

And I also want an infinite pagination for the listing. The tricky part was knowing how to combine the filter process with the infinite query. `react-query` has an infinite pagination hook already and it was easy to configure for a simple infinite pagination listing.

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

I needed to implement the fetching of next page param and has next page with supabase, instead of a normal fetch API described in the docs.

The `hasNextPage` variable is decided by the `getNextPageParam` function. where if you return anything that is `undefined` then `hasNextPage` will be false.

And whatever you return in `getNextPageParam` this will be the `pageParam` you get in the function you provide to `useInfiniteQuery`.

My supabase query at this point looked something like this

```js
const fetchRentals = async () => {
    supabase.from('listings').select()
}
```

I needed to configure this with pagination using the page param and so the query ended up looking something like this

```js
const fetchRentals = async (pageParam: number) => {
    const PAGE_SIZE = 5
    const from = pageParam * PAGE_SIZE
    const to = (pageParam + 1) * PAGE_SIZE - 1
    return supabase.from('listings').select().sort({ascending: false}).from(from, to)
}
```

Okay great, I implemented the supabase function and after which I implemented the getNextPageParam function. I got this code from somewhere but I forget where. After implementing it looked something like this

```js
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

Also initally `pageParam` will be undefined so you have to set it to zero for the initial query.

Great I implemented basic infinite query listing with supabase and react-query but now I had the tricky part of setting it up with the filters. I wanted to make sure that everytime I set a filter, the pageParam reset to zero.

For the filter I had a form which had the fields `minRent`, `maxRent`, `size`,`location`.

QueryKeys in react-query is actually an array. and `projects` get converted to `['projects']`. And you can also add other things to the array. Say any params we use can be added to this: `['projects', anyParamHere]` and this is passed on to the function we have in useInfiniteQuery. At this point I had also created the form using react-hook-form:

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