import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { CharacterType, ComputedPlayerData, ComputedSkillState } from "./types";
import { humanizeNumbers } from "./utils";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

type Props = {
  player: ComputedPlayerData;
  color: string;
};

const getSkillName = (
  characterType: CharacterType,
  skill: ComputedSkillState
) => {
  switch (true) {
    case skill.actionType === "LinkAttack":
      return t([
        `skills.${characterType}.link-attack`,
        "skills.default.link-attack",
      ]);
    case skill.actionType === "SBA":
      return t([
        `skills.${characterType}.skybound-arts`,
        "skills.default.skybound-arts",
      ]);
    case skill.actionType === "DamageOverTime":
      return t([
        `skills.${characterType}.damage-over-time`,
        "skills.default.damage-over-time",
      ]);
    case skill.actionType.hasOwnProperty("Normal"):
      let skillID = skill.actionType.Normal;
      return t(
        [
          `skills.${characterType}.${skillID}`,
          `skills.default.${skillID}`,
          `skills.default.unknown-skill`,
        ],
        { id: skillID }
      );
    default:
      return t("ui.unknown");
  }
};

const SkillRow = ({
  characterType,
  skill,
  color,
}: {
  characterType: CharacterType;
  skill: ComputedSkillState;
  color: string;
}) => {
  const [totalDamage, totalDamageUnit] = humanizeNumbers(skill.totalDamage);
  const [minDmg, minDmgUnit] = humanizeNumbers(skill.minDamage || 0);
  const [maxDmg, maxDmgUnit] = humanizeNumbers(skill.maxDamage || 0);
  const [averageDmg, averageDmgUnit] = humanizeNumbers(
    skill.hits === 0 ? 0 : skill.totalDamage / skill.hits
  );

  return (
    <tr className="skill-row">
      <td className="text-left row-data">
        {getSkillName(characterType, skill)}
      </td>
      <td className="text-center row-data">{skill.hits}</td>
      <td className="text-center row-data">
        {totalDamage}
        <span className="unit font-sm">{totalDamageUnit}</span>
      </td>
      <td className="text-center row-data">
        {skill.minDamage && minDmg}
        <span className="unit font-sm">{minDmgUnit}</span>
      </td>
      <td className="text-center row-data">
        {skill.maxDamage && maxDmg}
        <span className="unit font-sm">{maxDmgUnit}</span>
      </td>
      <td className="text-center row-data">
        {averageDmg}
        <span className="unit font-sm">{averageDmgUnit}</span>
      </td>
      <td className="text-center row-data">
        {skill.percentage.toFixed(2)}
        <span className="unit font-sm">%</span>
      </td>
      <div
        className="damage-bar"
        style={{ backgroundColor: color, width: `${skill.percentage}%` }}
      />
    </tr>
  );
};

const SkillBreakdown = ({ player, color }: Props) => {
  const totalDamage = player.skills.reduce(
    (acc, skill) => acc + skill.totalDamage,
    0
  );
  const computedSkills = player.skills.map((skill) => {
    return {
      percentage: (skill.totalDamage / totalDamage) * 100,
      ...skill,
    };
  });

  computedSkills.sort((a, b) => b.totalDamage - a.totalDamage);

  return (
    <tr className="skill-table">
      <td colSpan={100}>
        <table className="table w-full">
          <thead className="header transparent-bg">
            <tr>
              <th className="header-name">Skill Name</th>
              <th className="header-column text-center">Hits</th>
              <th className="header-column text-center">Total</th>
              <th className="header-column text-center">Min</th>
              <th className="header-column text-center">Max</th>
              <th className="header-column text-center">Avg</th>
              <th className="header-column text-center">%</th>
            </tr>
          </thead>
          <tbody className="transparent-bg">
            {computedSkills.map((skill) => (
              <SkillRow
                key={getSkillName(player.characterType, skill)}
                characterType={player.characterType}
                skill={skill}
                color={color}
              />
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  );
};

export const PlayerRow = ({ player, color }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [totalDamage, totalDamageUnit] = humanizeNumbers(player.totalDamage);
  const [dps, dpsUnit] = humanizeNumbers(player.dps);

  return (
    <Fragment>
      <tr
        className={`player-row ${isOpen ? "transparent-bg" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="text-left row-data">
          {player.index} - {t(`characters.${player.characterType}`)}
        </td>
        <td className="text-center row-data">
          {totalDamage}
          <span className="unit font-sm">{totalDamageUnit}</span>
        </td>
        <td className="text-center row-data">
          {dps}
          <span className="unit font-sm">{dpsUnit}</span>
        </td>
        <td className="text-center row-data">
          {player.percentage.toFixed(2)}
          <span className="unit font-sm">%</span>
        </td>
        <td className="text-center row-button">
          {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </td>
        <div
          className="damage-bar"
          style={{ backgroundColor: color, width: `${player.percentage}%` }}
        />
      </tr>
      {isOpen && <SkillBreakdown player={player} color={color} />}
    </Fragment>
  );
};