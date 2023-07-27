import { Box } from "@mui/material";
import Terminal from "../about/Terminal";
import React from "react";
import { info } from "../../info/Info";

export default function Retool() {
  const firstName = info.firstName.toLowerCase();

  function aboutMeText() {
    return (
      <>
        <p>
          <span style={{ color: info.baseColor }}>
            {firstName}
            {info.lastName.toLowerCase()} $
          </span>{" "}
          ls retoolApps/{" "}
        </p>
        <p>
          -r--r--r-- Jul 2023{"     "}
          <a
            href="https://petetheheat.retool.com/embedded/public/ed5aa339-80f7-4f6a-9cd0-a6be4e096ec7"
            target="_blank"
            rel="noreferrer"
          >
            MyBarMenu
          </a>
        </p>
      </>
    );
  }

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      mt={"3rem"}
    >
      <Terminal text={aboutMeText()} />
    </Box>
  );
}
