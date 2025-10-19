import React from "react";
import { Navigate } from "react-router-dom";
import Issuenote from "./Issuenote";           // Manager version
import UserIssueNote from "./UserIssueNote";   // User version

export default function IssueNoteWrapper() {
    const isManager = localStorage.getItem("isManager") === "true";

    return isManager ? <Issuenote /> : <UserIssueNote />;
}
