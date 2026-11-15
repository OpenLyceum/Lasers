/**
 * lasersQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * Usage: append e.g. `?name=value` to the sim URL (none are defined yet).
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import LasersNamespace from "../LasersNamespace.js";

const lasersQueryParameters = QueryStringMachine.getAll({});

LasersNamespace.register("lasersQueryParameters", lasersQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");
