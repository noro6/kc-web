import * as uiConstants from './constants/ui';
import * as itemsConstants from './constants/items';
import * as eventsConstants from './constants/events';
import * as shipsConstants from './constants/ships';
import * as battleConstants from './constants/battle';
import * as progressionConstants from './constants/progression';
import * as questsConstants from './constants/quests';
import * as expeditionsConstants from './constants/expeditions';

export * from './constants/types';
export * from './constants/enums';

export default class Const {
  public static readonly AIR_STATUS = uiConstants.AIR_STATUS;

  public static readonly AB_MODE_ITEMS = uiConstants.AB_MODE_ITEMS;

  public static readonly PLANE_TYPES = itemsConstants.PLANE_TYPES;

  public static readonly CB_PLANE_TYPES = itemsConstants.CB_PLANE_TYPES;

  public static readonly SP_PLANE_TYPES = itemsConstants.SP_PLANE_TYPES;

  public static readonly AB_PLANE_TYPES = itemsConstants.AB_PLANE_TYPES;

  public static readonly FIGHTERS = itemsConstants.FIGHTERS;

  public static readonly ATTACKERS = itemsConstants.ATTACKERS;

  public static readonly ASW_PLANES = itemsConstants.ASW_PLANES;

  public static readonly RECONNAISSANCES = itemsConstants.RECONNAISSANCES;

  public static readonly AB_ATTACKERS = itemsConstants.AB_ATTACKERS;

  public static readonly AB_ATTACKERS_LARGE = itemsConstants.AB_ATTACKERS_LARGE;

  public static readonly STRICT_DEPTH_CHARGE = itemsConstants.STRICT_DEPTH_CHARGE;

  public static readonly ROCKET = itemsConstants.ROCKET;

  public static readonly BAKUSEN = itemsConstants.BAKUSEN;

  public static readonly ENABLED_LAND_BASE_ATTACK = itemsConstants.ENABLED_LAND_BASE_ATTACK;

  public static readonly ENABLED_ASW_SUPPORT = itemsConstants.ENABLED_ASW_SUPPORT;

  public static readonly LATE_MODEL_TORPEDO = itemsConstants.LATE_MODEL_TORPEDO;

  public static readonly SPECIAL_GROUP = eventsConstants.SPECIAL_GROUP;

  public static readonly AIRBASE_MAP_BONUSES = eventsConstants.AIRBASE_MAP_BONUSES;

  public static readonly ITEM_API_TYPE = itemsConstants.ITEM_API_TYPE;

  public static readonly SHIP_TYPES_ALT_INFO = shipsConstants.SHIP_TYPES_ALT_INFO;

  public static readonly EXPANDED_ITEM_TYPE = itemsConstants.EXPANDED_ITEM_TYPE;

  public static readonly SHIP_SLOT_EQUIP_RESTRICTIONS = shipsConstants.SHIP_SLOT_EQUIP_RESTRICTIONS;

  public static readonly SHIP_TYPES_ALT = shipsConstants.SHIP_TYPES_ALT;

  public static readonly SHIP_TYPES_ALT2 = shipsConstants.SHIP_TYPES_ALT2;

  public static readonly SHIP_TYPES_ALT3 = shipsConstants.SHIP_TYPES_ALT3;

  public static readonly SHIP_TYPES_FORMAL = shipsConstants.SHIP_TYPES_FORMAL;

  public static readonly JPN = shipsConstants.JPN;

  public static readonly USA = shipsConstants.USA;

  public static readonly ITA = shipsConstants.ITA;

  public static readonly GBR = shipsConstants.GBR;

  public static readonly DEU = shipsConstants.DEU;

  public static readonly FRA = shipsConstants.FRA;

  public static readonly RUS = shipsConstants.RUS;

  public static readonly SWE = shipsConstants.SWE;

  public static readonly AUS = shipsConstants.AUS;

  public static readonly NLD = shipsConstants.NLD;

  public static readonly NOR = shipsConstants.NOR;

  public static readonly THA = shipsConstants.THA;

  public static readonly FORMATIONS = battleConstants.FORMATIONS;

  public static readonly SUPPORTS = battleConstants.SUPPORTS;

  public static readonly ITEM_TYPES_ALT = itemsConstants.ITEM_TYPES_ALT;

  public static readonly CELL_TYPES = battleConstants.CELL_TYPES;

  public static readonly DIFFICULTY_LEVELS = uiConstants.DIFFICULTY_LEVELS;

  public static readonly PROF_LEVEL_BORDER = progressionConstants.PROF_LEVEL_BORDER;

  public static readonly MANUAL_AVOID = battleConstants.MANUAL_AVOID;

  public static readonly EXPAND_SLOT_INDEX = progressionConstants.EXPAND_SLOT_INDEX;

  public static readonly MAX_LEVEL = progressionConstants.MAX_LEVEL;

  public static readonly PREVIOUS_MAX_LEVEL = progressionConstants.PREVIOUS_MAX_LEVEL;

  public static readonly AVOID_TYPE = battleConstants.AVOID_TYPE;

  public static readonly ANTI_AIR_CUT_IN_PRIORITIES = battleConstants.ANTI_AIR_CUT_IN_PRIORITIES;

  public static readonly ANTI_AIR_CUTIN = battleConstants.ANTI_AIR_CUTIN;

  public static readonly LEVEL_BORDERS = progressionConstants.LEVEL_BORDERS;

  public static readonly FILE_COLORS = uiConstants.FILE_COLORS;

  public static readonly RANKING_POINT_QUESTS = questsConstants.RANKING_POINT_QUESTS;

  public static readonly EXPEDITIONS = expeditionsConstants.EXPEDITIONS;
}
