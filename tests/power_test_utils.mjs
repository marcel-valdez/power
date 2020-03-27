// jshint esversion: 6

import {Rook} from '../core/rook.mjs';
import {King} from '../core/king.mjs';
import {Knight} from '../core/knight.mjs';
import {Pawn} from '../core/pawn.mjs';
import {Side} from '../core/power.common.mjs';

export const whtPawn = (x, y, power = 0) =>
  new Pawn({ side: Side.WHITE, position: [x,y], power });

export const blkPawn = (x, y, power = 0) =>
  new Pawn({ side: Side.BLACK, position: [x,y], power });

export const whtKnight = (x, y, power = 0) =>
  new Knight({ side: Side.WHITE, position: [x,y], power });

export const blkKnight = (x, y, power = 0) =>
  new Knight({ side: Side.BLACK, position: [x,y], power });

export const whtRook = (x, y, power = 0) =>
  new Rook({ side: Side.WHITE, position: [x,y], power });

export const blkRook = (x, y, power = 0) =>
  new Rook({ side: Side.BLACK, position: [x,y], power });

export const whtKing = (x, y, power = 0) =>
  new King({ side: Side.WHITE, position: [x,y], power });

export const blkKing = (x, y, power = 0) =>
  new King({ side: Side.BLACK, position: [x,y], power });
