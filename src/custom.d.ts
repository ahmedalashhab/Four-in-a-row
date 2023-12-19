declare module "*.svg" {
  const content:
    | React.FunctionComponent<React.SVGAttributes<React.ReactSVGElement>>
    | any;
  export default content;
}
