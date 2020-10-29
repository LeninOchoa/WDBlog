import Cookies from 'js-cookie'

export default {
  nuxtServerInit(vuexContext, context) {
    return context.app.$axios.$get('/posts.json')
      .then(data => {
        const postsArray = []
        for(const key in data) {
          postsArray.push({ ...data[key], id: key })
        }
        vuexContext.commit('setPosts', postsArray)
      })
      .catch(e => {
        context.error(e)
      })
  },
  addPost(vuexContext, post) {
    const createPost = {
      ...post,
      updatedDate: new Date()
    }
    return this.$axios.$post('/posts.jsonauth=' + vuexContext.state.token, createPost)
      .then(result => {
        vuexContext.commit('addPost', {...createPost, id: result.data.name})
      })
      .catch(e => console.log(e))
  },
  editPost(vuexContext, editedPost) {
    return this.$axios.$put('/posts/'
      + editedPost.id + '.json?auth=' + vuexContext.state.token
      , editedPost)
      .then(res => {
        vuexContext.commit('editPost', editedPost)
      })
      .catch(e => console.log(e))
  },
  setPosts(vuexContext, posts) {
    vuexContext.commit('setPosts', posts);
  },
  authenticateUser(vuexContext, authData) {
    let authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + process.env.fbAPIKey;
    if (!authData.isLogin) {
      authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + process.env.fbAPIKey
    }
    return this.$axios.$post(authUrl, {
        email: authData.email,
        password:authData.password,
        returnSecureToken: true
      }
    ).then(result => {
      vuexContext.commit('setToken', result.idToken)
      localStorage.setItem('token',result.idToken)
      localStorage.setItem('tokenExpiration', new Date().getTime() + Number.parseInt(result.expiresIn) * 1000)
      Cookies.set('jwt', result.idToken)
      Cookies.set('expirationDate', new Date().getTime() + Number.parseInt(result.expiresIn) * 1000)
    })
      .catch(e => console.log(e))
  },
  setLogoutTimer(vuexContext, duration) {
    setTimeout(() => {
      vuexContext.commit('clearToken')
    }, duration)

  },
  initAuth(vuexContext, req) {

    let token;
    let expirationDate;

    if (req) {
      if (!req.headers.cookie) {
        return;
      }
      const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='))
      if (!jwtCookie) {
        return;
      }
      token = jwtCookie.split('=')[1]
      expirationDate = req.headers.cookie.split(';')
        .find(c => c.trim().startsWith('expirationDate=')).split('=')[1]
    } else {
      token = localStorage.getItem('token')
      expirationDate = localStorage.getItem('tokenExpiration')
    }
    if (new Date().getTime() > +expirationDate || !token) {
      console.log('No token or invalid token')
      vuexContext.dispatch('logout')
      return;
    }
    vuexContext.commit('setToken', token)
  },
  logout(vuexContext) {
    vuexContext.commit('clearToken')
    Cookies.remove('jwt')
    Cookies.remove('expirationDate')
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiration')
    }

  }
};
