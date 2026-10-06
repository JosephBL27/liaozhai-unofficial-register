export default {
  multipass: true,
  js2svg: {
    pretty: false,
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false,
          removeDesc: false,
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
          },
        },
      },
    },
  ],
};
