export default {
  loadedPosts(state) {
    return state.loadedPosts;
  },
  isAutheticated(state) {
    return state.token != null;
  }
};
