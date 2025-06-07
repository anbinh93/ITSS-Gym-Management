import { splitProps } from "solid-js"

import { cn } from "../../lib/utils"

const Card = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", local.class)}
      {...others} />
  );
}

const CardHeader = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div className={cn("flex flex-col space-y-1.5 p-6", local.class)} {...others} />;
}

const CardTitle = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", local.class)}
      {...others}>
      {props.children || "Card Title"}
    </h3>
  );
}

const CardDescription = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <p className={cn("text-sm text-muted-foreground", local.class)} {...others} />;
}

const CardContent = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div className={cn("p-6 pt-0", local.class)} {...others} />;
}

const CardFooter = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div className={cn("flex items-center p-6 pt-0", local.class)} {...others} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
